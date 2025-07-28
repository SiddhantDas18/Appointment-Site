import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import type { NextRequest } from "next/server"

const JWT_SECRET = process.env.JWT_SECRET!

export interface JWTPayload {
  userId: string
  email: string
  role: "USER" | "DOCTOR" | "ADMIN"
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

export function requireAuth(allowedRoles: string[] = []) {
  return async (request: NextRequest) => {
    const token = getTokenFromRequest(request)
    if (!token) {
      return { error: "Unauthorized", status: 401 }
    }

    const payload = verifyToken(token)
    if (!payload) {
      return { error: "Invalid token", status: 401 }
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(payload.role)) {
      return { error: "Forbidden", status: 403 }
    }

    return { user: payload }
  }
}
