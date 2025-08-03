import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyToken } from "@/lib/auth"

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

    const appointments = await prisma.appointment.findMany({
      where: {
        doctorId: payload.userId,
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      orderBy: {
        date: "desc"
      }
    })

    const confirmedRevenue = appointments
      .filter(apt => apt.status === "COMPLETED" && apt.paymentStatus === "PAID")
      .reduce((sum, apt) => sum + apt.amount, 0)

    const pendingRevenue = appointments
      .filter(apt => apt.status === "BOOKED" && apt.paymentStatus === "PAID")
      .reduce((sum, apt) => sum + apt.amount, 0)

    return NextResponse.json({
      confirmedRevenue,
      pendingRevenue,
      appointments: appointments.map(apt => ({
        id: apt.id,
        date: apt.date,
        time: apt.time,
        amount: apt.amount,
        status: apt.status,
        paymentStatus: apt.paymentStatus,
        user: apt.user
      }))
    })
  } catch (error) {
    console.error("Error fetching revenue:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}