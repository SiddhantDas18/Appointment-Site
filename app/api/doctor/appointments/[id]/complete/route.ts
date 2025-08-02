import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { verifyToken } from "@/lib/auth"

const prisma = new PrismaClient()

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== "DOCTOR") {
      return NextResponse.json({ error: "Only doctors can mark appointments as completed" }, { status: 403 })
    }

    const { id: appointmentId } = await params

    // Find the appointment and verify it belongs to this doctor
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        doctor: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    if (appointment.doctorId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized - not your appointment" }, { status: 403 })
    }

    if (appointment.status !== "BOOKED") {
      return NextResponse.json({ 
        error: "Only booked appointments can be marked as completed" 
      }, { status: 400 })
    }

    // Update appointment status to completed
    const updatedAppointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: "COMPLETED"
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        doctor: {
          select: { id: true, name: true, email: true }
        }
      }
    })

    return NextResponse.json({
      message: "Appointment marked as completed",
      appointment: updatedAppointment
    })

  } catch (error) {
    console.error("Error marking appointment as completed:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
