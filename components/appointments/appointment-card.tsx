"use client"

import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, CreditCard } from "lucide-react"
import type { Appointment } from "@/types"

interface AppointmentCardProps {
  appointment: Appointment
  onCancel?: (id: string) => void
  onReschedule?: (id: string) => void
  showActions?: boolean
}

export default function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  showActions = true,
}: AppointmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "BOOKED":
        return "bg-blue-100 text-blue-800"
      case "COMPLETED":
        return "bg-green-100 text-green-800"
      case "CANCELLED":
        return "bg-red-100 text-red-800"
      case "RESCHEDULED":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "FAILED":
        return "bg-red-100 text-red-800"
      case "REFUNDED":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{appointment.doctor?.name || "Dr. Unknown"}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
            <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>{appointment.paymentStatus}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{format(new Date(appointment.date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{appointment.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm">{appointment.type}</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-gray-500" />
            <span className="text-sm">₹{appointment.amount}</span>
          </div>
        </div>

        {appointment.notes && (
          <div className="text-sm text-gray-600">
            <strong>Notes:</strong> {appointment.notes}
          </div>
        )}

        {appointment.isRescheduleRequested && (
          <div className="bg-yellow-50 p-3 rounded-md">
            <p className="text-sm text-yellow-800">Reschedule requested: {appointment.rescheduleReason}</p>
          </div>
        )}

        {showActions && appointment.status === "BOOKED" && (
          <div className="flex gap-2 pt-2">
            {onReschedule && (
              <Button variant="outline" size="sm" onClick={() => onReschedule(appointment.id)}>
                Request Reschedule
              </Button>
            )}
            {onCancel && (
              <Button variant="destructive" size="sm" onClick={() => onCancel(appointment.id)}>
                Cancel
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
