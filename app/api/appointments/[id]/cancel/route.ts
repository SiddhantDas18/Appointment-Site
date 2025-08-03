import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { createRefund } from "@/lib/razorpay"
import { sendEmail, generateCancellationEmail } from "@/lib/email"

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(["USER"])(request)
    if ("error" in authResult) {
      return NextResponse.json(authResult, { status: authResult.status })
    }

    const { id } = await params

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        userId: authResult.user.userId,
        status: "BOOKED",
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
        doctor: {
          select: { name: true, email: true },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or cannot be cancelled" }, { status: 404 })
    }

    // Process refund if payment was made
    let refundId = null
    if (appointment.paymentId && appointment.paymentStatus === "PAID") {
      const refundResult = await createRefund(appointment.paymentId)
      if (refundResult.success && refundResult.refund) {
        refundId = refundResult.refund.id
      }
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        status: "CANCELLED",
        paymentStatus: refundId ? "REFUNDED" : appointment.paymentStatus,
        refundId,
      },
    })

    // Add the slot back to availability (avoid duplicates)
    const existingAvailability = await prisma.availability.findUnique({
      where: {
        doctorId_date: {
          doctorId: appointment.doctorId,
          date: appointment.date,
        },
      },
    })

    if (existingAvailability) {
      if (!existingAvailability.timeSlots.includes(appointment.time)) {
        const sortedSlots = [...existingAvailability.timeSlots, appointment.time]
          .sort((a, b) => {
            const [aHour, aMin] = a.split(':').map(Number)
            const [bHour, bMin] = b.split(':').map(Number)
            return (aHour * 60 + aMin) - (bHour * 60 + bMin)
          })
        
        await prisma.availability.update({
          where: {
            doctorId_date: {
              doctorId: appointment.doctorId,
              date: appointment.date,
            },
          },
          data: { timeSlots: sortedSlots },
        })
      }
    } else {
      await prisma.availability.create({
        data: {
          doctorId: appointment.doctorId,
          date: appointment.date,
          timeSlots: [appointment.time],
        },
      })
    }

    // Send cancellation emails
    const emailHtml = generateCancellationEmail(
      appointment.user.name,
      appointment.doctor.name,
      appointment.date.toLocaleDateString(),
      appointment.time,
      appointment.amount,
    )

    await sendEmail({
      to: appointment.user.email,
      subject: "Appointment Cancelled",
      html: emailHtml,
    })

    await sendEmail({
      to: appointment.doctor.email,
      subject: "Appointment Cancelled",
      html: emailHtml,
    })

    return NextResponse.json({
      message: "Appointment cancelled successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Cancel appointment error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
