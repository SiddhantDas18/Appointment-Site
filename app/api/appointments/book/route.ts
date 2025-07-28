import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { sendEmail, generateAppointmentConfirmationEmail } from "@/lib/email"
import { z } from "zod"
import crypto from "crypto"

const bookingSchema = z.object({
  doctorId: z.string(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
  paymentId: z.string(),
  orderId: z.string(),
  signature: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["USER"])(request)
    if ("error" in authResult) {
      return NextResponse.json(authResult, { status: authResult.status })
    }

    const body = await request.json()
    const { doctorId, date, time, notes, paymentId, orderId, signature } = bookingSchema.parse(body)

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex")

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 })
    }

    // Check if slot is still available
    const availability = await prisma.availability.findFirst({
      where: {
        doctorId,
        date: new Date(date),
      },
    })

    if (!availability || !availability.timeSlots.includes(time)) {
      return NextResponse.json({ error: "Time slot is no longer available" }, { status: 400 })
    }

    // Check if slot is already booked
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        doctorId,
        date: new Date(date),
        time,
        status: { not: "CANCELLED" },
      },
    })

    if (existingAppointment) {
      return NextResponse.json({ error: "Time slot is already booked" }, { status: 400 })
    }

    // Get doctor details for fee
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { name: true, consultationFee: true, email: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: authResult.user.userId },
      select: { name: true, email: true },
    })

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        userId: authResult.user.userId,
        doctorId,
        date: new Date(date),
        time,
        notes,
        paymentId,
        paymentStatus: "PAID",
        amount: doctor.consultationFee,
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

    // Remove booked slot from availability
    await prisma.availability.update({
      where: {
        doctorId_date: {
          doctorId,
          date: new Date(date),
        },
      },
      data: {
        timeSlots: {
          set: availability.timeSlots.filter((slot) => slot !== time),
        },
      },
    })

    // Send confirmation emails
    const emailHtml = generateAppointmentConfirmationEmail(
      user?.name || "Patient",
      doctor.name,
      new Date(date).toLocaleDateString(),
      time,
      appointment.id,
    )

    // Send to patient
    await sendEmail({
      to: user?.email || authResult.user.email,
      subject: "Appointment Confirmation",
      html: emailHtml,
    })

    // Send to doctor
    await sendEmail({
      to: doctor.email,
      subject: "New Appointment Booked",
      html: emailHtml,
    })

    return NextResponse.json({
      message: "Appointment booked successfully",
      appointment,
    })
  } catch (error) {
    console.error("Booking error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
