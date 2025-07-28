import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const rescheduleSchema = z.object({
  reason: z.string().min(1),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResult = await requireAuth(["USER"])(request)
    if ("error" in authResult) {
      return NextResponse.json(authResult, { status: authResult.status })
    }

    const body = await request.json()
    const { reason } = rescheduleSchema.parse(body)

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: params.id,
        userId: authResult.user.userId,
        status: "BOOKED",
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or cannot be rescheduled" }, { status: 404 })
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: params.id },
      data: {
        isRescheduleRequested: true,
        rescheduleReason: reason,
      },
    })

    return NextResponse.json({
      message: "Reschedule request submitted successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Reschedule request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
