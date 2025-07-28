import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { comparePassword, generateToken } from "@/lib/auth"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  userType: z.enum(["user", "doctor"]).optional().default("user"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, userType } = loginSchema.parse(body)

    let user
    if (userType === "doctor") {
      user = await prisma.doctor.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          specialization: true,
        },
      })
    } else {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
        },
      })
    }

    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: userType === "doctor" ? "DOCTOR" : (user as any).role || "USER",
    })

    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({
      token,
      user: {
        ...userWithoutPassword,
        role: userType === "doctor" ? "DOCTOR" : (user as any).role || "USER",
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
