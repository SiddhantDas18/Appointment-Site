import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"
import { z } from "zod"

const availabilitySchema = z.object({
  date: z.string(),
  timeSlots: z.array(z.string()),
})

// GET - Fetch doctor's availability
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const availabilities = await prisma.availability.findMany({
      where: {
        doctorId: payload.userId,
      },
      orderBy: {
        date: "asc",
      },
    })

    return NextResponse.json({ availabilities })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add new availability
export async function POST(request: NextRequest) {
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
    const { date, timeSlots } = availabilitySchema.parse(body)

    // Check if availability already exists for this date
    const existingAvailability = await prisma.availability.findUnique({
      where: {
        doctorId_date: {
          doctorId: payload.userId,
          date: new Date(date),
        },
      },
    })

    let availability
    if (existingAvailability) {
      // Update existing availability by merging time slots
      const combinedTimeSlots = [...new Set([...existingAvailability.timeSlots, ...timeSlots])]
      availability = await prisma.availability.update({
        where: {
          id: existingAvailability.id,
        },
        data: {
          timeSlots: combinedTimeSlots,
        },
      })
    } else {
      // Create new availability
      availability = await prisma.availability.create({
        data: {
          doctorId: payload.userId,
          date: new Date(date),
          timeSlots,
        },
      })
    }

    return NextResponse.json({ availability })
  } catch (error) {
    console.error("Error creating availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Remove availability slot
export async function DELETE(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload || payload.role !== "DOCTOR") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const availabilityId = searchParams.get("id")

    if (!availabilityId) {
      return NextResponse.json({ error: "Availability ID required" }, { status: 400 })
    }

    await prisma.availability.delete({
      where: {
        id: availabilityId,
        doctorId: payload.userId, // Ensure doctor can only delete their own slots
      },
    })

    return NextResponse.json({ message: "Availability deleted successfully" })
  } catch (error) {
    console.error("Error deleting availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
