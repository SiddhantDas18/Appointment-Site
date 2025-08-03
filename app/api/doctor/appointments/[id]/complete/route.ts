import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id: params.id }
    })

    if (!appointment || appointment.doctorId !== payload.userId) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 })
    }

    if (appointment.status !== "BOOKED" || appointment.paymentStatus !== "PAID") {
      return NextResponse.json({ error: "Cannot complete this appointment" }, { status: 400 })
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: { status: "COMPLETED" }
    })

    return NextResponse.json({ appointment: updatedAppointment })
  } catch (error) {
    console.error("Error completing appointment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}