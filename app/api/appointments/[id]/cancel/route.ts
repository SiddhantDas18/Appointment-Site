import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { createRefund } from "@/lib/razorpay"
import { sendEmail, generateCancellationEmail } from "@/lib/email"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(["USER"])(request)
    if ("error" in authResult) {
      return NextResponse.json(authResult, { status: authResult.status })
    }

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
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
      if (refundResult.success) {
        refundId = refundResult.refund.id
      }
    }

    // Update appointment status
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        status: "CANCELLED",
        paymentStatus: refundId ? "REFUNDED" : appointment.paymentStatus,
        refundId,
      },
    })

    // Add the slot back to availability
    await prisma.availability.upsert({
      where: {
        doctorId_date: {
          doctorId: appointment.doctorId,
          date: appointment.date,
        },
      },
      update: {
        timeSlots: {
          push: appointment.time,
        },
      },
      create: {
        doctorId: appointment.doctorId,
        date: appointment.date,
        timeSlots: [appointment.time],
      },
    })

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
