// Comment out the nodemailer import and transporter setup
// import nodemailer from "nodemailer"

// const transporter = nodemailer.createTransporter({
//   host: process.env.SMTP_HOST,
//   port: Number.parseInt(process.env.SMTP_PORT || "587"),
//   secure: false,
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS,
//   },
// })

export interface EmailData {
  to: string
  subject: string
  html: string
}

export async function sendEmail(data: EmailData) {
  // For now, just log the email instead of sending
  console.log("📧 Email would be sent:", {
    to: data.to,
    subject: data.subject,
    preview: data.html.substring(0, 100) + "...",
  })

  // Simulate successful email sending
  return { success: true }
}

// Keep the email template functions as they are
export function generateAppointmentConfirmationEmail(
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
  appointmentId: string,
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Appointment Confirmation</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment has been confirmed with the following details:</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Appointment ID:</strong> ${appointmentId}</p>
      </div>
      <p>Please arrive 10 minutes before your scheduled time.</p>
      <p>Best regards,<br>Healthcare Team</p>
    </div>
  `
}

export function generateCancellationEmail(
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
  refundAmount: number,
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Appointment Cancelled</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment has been cancelled:</p>
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Time:</strong> ${time}</p>
        <p><strong>Refund Amount:</strong> ₹${refundAmount}</p>
      </div>
      <p>Your refund will be processed within 5-7 business days.</p>
      <p>Best regards,<br>Healthcare Team</p>
    </div>
  `
}

export function generateRescheduleConfirmationEmail(
  patientName: string,
  doctorName: string,
  date: string,
  time: string,
  amount: number,
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #059669;">Appointment Rescheduled</h2>
      <p>Dear ${patientName},</p>
      <p>Your appointment has been successfully rescheduled:</p>
      <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Doctor:</strong> ${doctorName}</p>
        <p><strong>New Date:</strong> ${date}</p>
        <p><strong>New Time:</strong> ${time}</p>
        <p><strong>Amount:</strong> ₹${amount}</p>
      </div>
      <p>Please arrive 10 minutes before your scheduled time.</p>
      <p>Best regards,<br>Healthcare Team</p>
    </div>
  `
}
