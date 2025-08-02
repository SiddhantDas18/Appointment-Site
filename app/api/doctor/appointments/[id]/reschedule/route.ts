import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"
import { sendEmail, generateRescheduleConfirmationEmail } from "@/lib/email"

const rescheduleSchema = z.object({
  date: z.string(),
  time: z.string(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { date, time } = rescheduleSchema.parse(body)

    // Find the appointment and ensure it belongs to the doctor
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        doctorId: payload.userId,
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
      return NextResponse.json({ error: "Appointment not found or cannot be rescheduled" }, { status: 404 })
    }

    const newDate = new Date(date)

    // Check if the new slot is available
    const availability = await prisma.availability.findFirst({
      where: {
        doctorId: payload.userId,
        date: newDate,
      },
    })

    if (!availability || !availability.timeSlots.includes(time)) {
      return NextResponse.json({ error: "New time slot is not available" }, { status: 400 })
    }

    // Check if the new slot is already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId: payload.userId,
        date: newDate,
        time,
        status: { not: "CANCELLED" },
        id: { not: params.id },
      },
    })

    if (existingAppointment) {
      return NextResponse.json({ error: "New time slot is already booked" }, { status: 400 })
    }

    // Free up the old slot
    await prisma.availability.upsert({
      where: {
        doctorId_date: {
          doctorId: payload.userId,
          date: appointment.date,
        },
      },
      update: {
        timeSlots: {
          push: appointment.time,
        },
      },
      create: {
        doctorId: payload.userId,
        date: appointment.date,
        timeSlots: [appointment.time],
      },
    })

    // Remove the new slot from availability
    await prisma.availability.update({
      where: {
        doctorId_date: {
          doctorId: payload.userId,
          date: newDate,
        },
      },
      data: {
        timeSlots: {
          set: availability.timeSlots.filter((slot) => slot !== time),
        },
      },
    })

    // Update the appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        date: newDate,
        time,
        isRescheduleRequested: false,
        rescheduleReason: null,
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

    // Send confirmation emails
    const emailHtml = generateRescheduleConfirmationEmail(
      appointment.user.name,
      appointment.doctor.name,
      newDate.toLocaleDateString(),
      time,
      appointment.amount,
    )

    await sendEmail({
      to: appointment.user.email,
      subject: "Appointment Rescheduled",
      html: emailHtml,
    })

    await sendEmail({
      to: appointment.doctor.email,
      subject: "Appointment Rescheduled",
      html: emailHtml,
    })

    return NextResponse.json({
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Error rescheduling appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
