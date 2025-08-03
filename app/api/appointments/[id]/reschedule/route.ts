import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"
import { z } from "zod"

const rescheduleSchema = z.object({
  reason: z.string().min(1),
  newDate: z.string(),
  newTime: z.string(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const authResult = await requireAuth(["USER"])(request)
    if ("error" in authResult) {
      return NextResponse.json(authResult, { status: authResult.status })
    }

    const body = await request.json()
    const { reason, newDate, newTime } = rescheduleSchema.parse(body)

    const { id } = await params

    const appointment = await prisma.appointment.findFirst({
      where: {
        id: id,
        userId: authResult.user.userId,
        status: "BOOKED",
      },
    })

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found or cannot be rescheduled" }, { status: 404 })
    }

    // Check if new slot is available
    const newSlotDate = new Date(newDate)
    const availability = await prisma.availability.findUnique({
      where: {
        doctorId_date: {
          doctorId: appointment.doctorId,
          date: newSlotDate,
        },
      },
    })

    if (!availability || !availability.timeSlots.includes(newTime)) {
      return NextResponse.json({ error: "Selected time slot is not available" }, { status: 400 })
    }

    // Free up old slot
    const oldAvailability = await prisma.availability.findUnique({
      where: {
        doctorId_date: {
          doctorId: appointment.doctorId,
          date: appointment.date,
        },
      },
    })

    if (oldAvailability) {
      const sortedSlots = [...oldAvailability.timeSlots, appointment.time]
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
    } else {
      await prisma.availability.create({
        data: {
          doctorId: appointment.doctorId,
          date: appointment.date,
          timeSlots: [appointment.time],
        },
      })
    }

    // Remove new slot from availability
    await prisma.availability.update({
      where: {
        doctorId_date: {
          doctorId: appointment.doctorId,
          date: newSlotDate,
        },
      },
      data: {
        timeSlots: availability.timeSlots.filter(slot => slot !== newTime),
      },
    })

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id: id },
      data: {
        date: newSlotDate,
        time: newTime,
        status: "RESCHEDULED",
        rescheduleReason: reason,
      },
    })

    return NextResponse.json({
      message: "Appointment rescheduled successfully",
      appointment: updatedAppointment,
    })
  } catch (error) {
    console.error("Reschedule request error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
