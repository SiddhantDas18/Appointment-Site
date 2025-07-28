export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: "USER" | "DOCTOR" | "ADMIN"
}

export interface Doctor {
  id: string
  name: string
  email: string
  specialization: string
  experience?: string
  photo?: string
  about?: string
  consultationFee: number
}

export interface Appointment {
  id: string
  userId: string
  doctorId: string
  date: Date
  time: string
  type: string
  status: "BOOKED" | "COMPLETED" | "CANCELLED" | "RESCHEDULED"
  paymentId?: string
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  refundId?: string
  amount: number
  isRescheduleRequested: boolean
  rescheduleReason?: string
  notes?: string
  user?: User
  doctor?: Doctor
}

export interface Availability {
  id: string
  doctorId: string
  date: Date
  timeSlots: string[]
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupData {
  name: string
  email: string
  password: string
  phone?: string
  role?: "USER" | "DOCTOR"
  specialization?: string
}
