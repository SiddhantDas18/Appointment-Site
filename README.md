# Doctor Appointment Booking Platform

A comprehensive full-stack appointment booking system built with Next.js, PostgreSQL, Prisma, and Razorpay integration.

## Features

- **User Authentication**: JWT-based login for patients and doctors
- **Appointment Booking**: Real-time slot booking with payment integration
- **Payment Processing**: Secure payments via Razorpay with refund support
- **Email Notifications**: Email templates ready (SMTP setup optional)
- **Doctor Dashboard**: Availability management and appointment tracking
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens
- **Payments**: Razorpay integration
- **Styling**: Tailwind CSS + shadcn/ui
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Razorpay account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd doctor-appointment-booking
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
\`\`\`

Fill in your database URL, JWT secret, and Razorpay keys.

4. Set up the database:
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

## Email System

The email system is currently set to log emails to the console instead of sending them. To enable actual email sending:

1. Install nodemailer: `npm install nodemailer @types/nodemailer`
2. Add SMTP configuration to your `.env` file
3. Uncomment the email sending code in `lib/email.ts`

## Database Schema

The application uses the following main models:

- **User**: Patient information and authentication
- **Doctor**: Doctor profiles and credentials  
- **Appointment**: Booking details with payment info
- **Availability**: Doctor's available time slots

## API Routes

### Authentication
- `POST /api/auth/signup` - User/doctor registration
- `POST /api/auth/login` - User/doctor login

### Appointments
- `GET /api/appointments` - Get user's appointments
- `POST /api/appointments/book` - Book new appointment
- `DELETE /api/appointments/[id]/cancel` - Cancel appointment
- `PATCH /api/appointments/[id]/reschedule` - Request reschedule

### Payments
- `POST /api/payment/create-order` - Create Razorpay order
- `POST /api/payment/refund` - Process refunds

### Availability
- `GET /api/availability` - Get available slots
- `POST /api/availability/add` - Add doctor availability

## Key Features Implementation

### Payment Integration
- Razorpay order creation and verification
- Automatic refund processing for cancellations
- Payment status tracking

### Email System
- Email templates for appointment confirmations
- Cancellation notifications with refund details
- Console logging for development (SMTP optional)

### Security
- JWT token authentication
- Role-based access control
- Payment signature verification
- Input validation with Zod

## Deployment

1. Set up production database
2. Configure environment variables
3. Deploy to Vercel or your preferred platform
4. Set up webhook endpoints for payment confirmations

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.
