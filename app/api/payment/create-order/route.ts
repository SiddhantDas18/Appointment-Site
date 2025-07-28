import { type NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { createRazorpayOrder } from "@/lib/razorpay"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const orderSchema = z.object({
  amount: z.number().positive(),
  doctorId: z.string(),
  date: z.string(),
  time: z.string(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth(["USER"])(request)
    if ("error" in authResult) {
      return NextResponse.json(authResult, { status: authResult.status })
    }

    const body = await request.json()
    const { amount, doctorId, date, time, notes } = orderSchema.parse(body)

    // Verify doctor exists
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId },
      select: { name: true, consultationFee: true },
    })

    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
    }

    // Verify amount matches consultation fee
    if (amount !== doctor.consultationFee) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 })
    }

    // Create Razorpay order
    const orderResult = await createRazorpayOrder({
      amount,
      receipt: `appointment_${Date.now()}`,
      notes: {
        doctorId,
        userId: authResult.user.userId,
        date,
        time,
        notes: notes || "",
      },
    })

    if (!orderResult.success) {
      return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
    }

    return NextResponse.json({
      order: orderResult.order,
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
