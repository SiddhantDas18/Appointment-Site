import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  const authResult = await requireAuth(["DOCTOR"])(request)
  if ("error" in authResult) {
    return NextResponse.json(authResult, { status: authResult.status })
  }
  const doctor = await prisma.doctor.findUnique({
    where: { id: authResult.user.userId },
    select: {
      id: true,
      name: true,
      specialization: true,
      about: true,
      consultationFee: true,
      photo: true,
    },
  })
  if (!doctor) {
    return NextResponse.json({ error: "Doctor not found" }, { status: 404 })
  }
  return NextResponse.json({ doctor })
}

export async function PATCH(request: NextRequest) {
  const authResult = await requireAuth(["DOCTOR"])(request)
  if ("error" in authResult) {
    return NextResponse.json(authResult, { status: authResult.status })
  }
  const body = await request.json()
  const updateData: any = {}
  if (body.name && typeof body.name === "string") updateData.name = body.name
  if (body.specialization && typeof body.specialization === "string") updateData.specialization = body.specialization
  if (body.about && typeof body.about === "string") updateData.about = body.about
  if (typeof body.consultationFee === "number" && body.consultationFee >= 0) updateData.consultationFee = body.consultationFee
  if (body.photo && typeof body.photo === "string") updateData.photo = body.photo
  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
  }
  const doctor = await prisma.doctor.update({
    where: { id: authResult.user.userId },
    data: updateData,
    select: { id: true, name: true, specialization: true, about: true, consultationFee: true, photo: true },
  })
  return NextResponse.json({ doctor })
}
