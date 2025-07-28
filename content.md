I want to build a full-stack appointment booking system for a doctor using Next.js (App Router) with the following stack and features:

🧱 Tech Stack
Framework: Next.js (App Router, TypeScript)

Styling: TailwindCSS

Backend: API Routes or Route Handlers (inside Next.js)

Database: PostgreSQL with Prisma ORM

Authentication: JWT-based login (next-auth optional but not necessary)

Payment Gateway: Razorpay for payments and refunds

Email Service: NodeMailer or SendGrid

🧑‍⚕️ Project Use Case
A doctor wants a website where:

They can write about themselves (name, specialization, photo)

Users can register, log in, book appointments, and pay

The doctor can set their availability slots (date + time)

Users can choose available slots

Appointments can only be rescheduled or canceled by the doctor/admin

🔐 Authentication
JWT-based login for:

Users (patients)

Doctors (admin)

Middleware for protecting API routes by role (doctor or user)

📅 Appointments
Users:

Can book appointments from available doctor slots

Cannot change date/time after booking

Can request rescheduling (doctor handles it)

Can view all past/future appointments

Can cancel appointment (refund via Razorpay)

Doctor:

Can log in and access an admin dashboard

Can add/remove available slots (date + multiple time slots)

Can view all booked appointments

Can mark appointments as completed or reschedule them

💳 Payments with Razorpay
Users must pay via Razorpay before confirming a slot

Refund logic for cancellations

Payment status is stored with appointment

Webhook for payment confirmation (optional)

📧 Email Notifications
On booking: confirmation email to both doctor and user

On cancellation or reschedule: email update

🔧 Prisma Schema (PostgreSQL)
prisma
Copy
Edit
model User {
  id           String   @id @default(uuid())
  name         String
  email        String   @unique
  password     String
  role         Role     @default(USER)
  appointments Appointment[]
}

model Doctor {
  id             String   @id @default(uuid())
  name           String
  email          String   @unique
  password       String
  specialization String
  appointments   Appointment[]
  availabilities Availability[]
}

model Appointment {
  id         String   @id @default(uuid())
  user       User     @relation(fields: [userId], references: [id])
  userId     String
  doctor     Doctor   @relation(fields: [doctorId], references: [id])
  doctorId   String
  date       DateTime
  time       String
  type       String
  status     AppointmentStatus @default(BOOKED)
  paymentId  String
  refundId   String?
  createdAt  DateTime @default(now())
  isRescheduleRequested Boolean @default(false)
}

model Availability {
  id         String   @id @default(uuid())
  doctor     Doctor   @relation(fields: [doctorId], references: [id])
  doctorId   String
  date       DateTime
  timeSlots  String[] // ["10:00", "10:30"]
}

enum Role {
  USER
  DOCTOR
}

enum AppointmentStatus {
  BOOKED
  COMPLETED
  CANCELLED
  RESCHEDULED
}
📁 Folder Structure (Next.js App Router)
bash
Copy
Edit
/app
  /login
  /signup
  /about
  /appointments
    /new
    /[id]  // appointment details
  /doctor
    /dashboard
    /appointments
    /availability

/lib
  prisma.ts      // Prisma client setup
  auth.ts        // JWT utilities
  razorpay.ts    // Razorpay config

/api
  /auth
    login.ts
    signup.ts
  /appointments
    book.ts
    cancel.ts
    list.ts
    reschedule.ts
  /availability
    add.ts
    get.ts
  /payment
    create-order.ts
    refund.ts

/components
  AppointmentForm.tsx
  AvailabilityEditor.tsx
  AppointmentCard.tsx
  LoginForm.tsx
  SignupForm.tsx

/types
  appointment.ts
  auth.ts
🔐 API Functionality
Auth (JWT)
POST /api/auth/signup – user/doctor signup

POST /api/auth/login – returns JWT + user info

Appointments
POST /api/appointments/book – user books + pays

GET /api/appointments – get user’s appointments (JWT)

PATCH /api/appointments/:id/reschedule – only doctor can do this

DELETE /api/appointments/:id/cancel – user triggers cancellation + refund

Doctor Availability
POST /api/availability/add – add slot (doctor)

GET /api/availability?date=... – list open slots

Razorpay
POST /api/payment/create-order

POST /api/payment/refund

Optional: webhook handler

✅ Features to Build
User and doctor login/signup

Auth middleware with role-based checks

Razorpay integration (frontend + backend)

Email confirmation (NodeMailer)

Doctor availability editor

Rescheduling logic (only doctor can update)

Fully responsive UI with TailwindCSS

Prisma DB access with PostgreSQL