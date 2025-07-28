import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth(["USER"])(request)
    if ("error" in authResult) {
      return NextResponse.json(authResult, { status: authResult.status })
    }

    const appointments = await prisma.appointment.findMany({
      where: {
        userId: authResult.user.userId,
      },
      include: {
        doctor: {
          select: {
            name: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        date: "desc",
      },
    })

    return NextResponse.json({ appointments })
  } catch (error) {
    console.error("Error fetching appointments:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
