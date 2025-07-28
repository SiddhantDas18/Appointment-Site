import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { z } from "zod"

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  role: z.enum(["USER", "DOCTOR"]).default("USER"),
  specialization: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, phone, role, specialization } = signupSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    const existingDoctor = await prisma.doctor.findUnique({
      where: { email },
    })

    if (existingUser || existingDoctor) {
      return NextResponse.json({ error: "User already exists with this email" }, { status: 400 })
    }

    const hashedPassword = await hashPassword(password)

    if (role === "DOCTOR") {
      if (!specialization) {
        return NextResponse.json({ error: "Specialization is required for doctors" }, { status: 400 })
      }

      const doctor = await prisma.doctor.create({
        data: {
          name,
          email,
          password: hashedPassword,
          specialization,
        },
        select: {
          id: true,
          name: true,
          email: true,
          specialization: true,
        },
      })

      return NextResponse.json({
        message: "Doctor account created successfully",
        user: doctor,
      })
    } else {
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          phone,
          role,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      })

      return NextResponse.json({
        message: "User account created successfully",
        user,
      })
    }
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
