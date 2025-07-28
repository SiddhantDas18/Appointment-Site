import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const doctorId = searchParams.get("doctorId")
    const date = searchParams.get("date")

    if (!doctorId || !date) {
      return NextResponse.json({ error: "Doctor ID and date are required" }, { status: 400 })
    }

    const availability = await prisma.availability.findFirst({
      where: {
        doctorId,
        date: new Date(date),
      },
    })

    return NextResponse.json({
      timeSlots: availability?.timeSlots || [],
    })
  } catch (error) {
    console.error("Error fetching availability:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
