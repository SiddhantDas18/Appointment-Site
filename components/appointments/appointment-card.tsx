"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, Clock, User, MoreVertical, Phone, Mail } from "lucide-react"
import type { Appointment } from "@/types"

interface AppointmentCardProps {
  appointment: Appointment
  onCancel?: (id: string) => void
  onReschedule?: (id: string) => void
  onOpenActions?: () => void
  showActions?: boolean
  className?: string
}

export default function AppointmentCard({
  appointment,
  onCancel,
  onReschedule,
  onOpenActions,
  showActions = true,
  className = ""
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
        return "bg-orange-100 text-orange-800"
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
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className={`transition-shadow hover:shadow-md ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">
              {appointment.doctor?.name || "Unknown Doctor"}
            </CardTitle>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(appointment.date).toLocaleDateString()}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {appointment.time}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(appointment.status)}>
              {appointment.status}
            </Badge>
            
            {showActions && (appointment.status === "BOOKED" || appointment.isRescheduleRequested) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {appointment.status === "BOOKED" && (
                    <>
                      <DropdownMenuItem onClick={() => onOpenActions?.()}>
                        Manage Appointment
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onReschedule?.(appointment.id)}
                        className="text-orange-600"
                      >
                        Request Reschedule
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => onCancel?.(appointment.id)}
                        className="text-red-600"
                      >
                        Cancel Appointment
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Patient Info (for doctor view) */}
          {appointment.user && (
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-gray-400" />
              <span>{appointment.user.name}</span>
              {appointment.user.email && (
                <div className="flex items-center space-x-1 text-gray-500">
                  <Mail className="h-3 w-3" />
                  <span className="text-xs">{appointment.user.email}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Appointment Details */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium">{appointment.type}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Amount:</span>
            <span className="font-medium">₹{appointment.amount}</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Payment:</span>
            <Badge className={getPaymentStatusColor(appointment.paymentStatus)}>
              {appointment.paymentStatus}
            </Badge>
          </div>

          {/* Reschedule Request Indicator */}
          {appointment.isRescheduleRequested && (
            <div className="p-2 bg-orange-50 border border-orange-200 rounded-md">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-orange-800 font-medium">
                  Reschedule Requested
                </span>
              </div>
              {appointment.rescheduleReason && (
                <p className="text-xs text-orange-700 mt-1">
                  Reason: {appointment.rescheduleReason}
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {appointment.notes && (
            <div className="p-2 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Notes:</span> {appointment.notes}
              </p>
            </div>
          )}

          {/* Mobile Actions */}
          {showActions && (appointment.status === "BOOKED" || appointment.isRescheduleRequested) && (
            <div className="flex space-x-2 sm:hidden">
              {appointment.status === "BOOKED" && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => onReschedule?.(appointment.id)}
                    className="flex-1"
                  >
                    Reschedule
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    onClick={() => onCancel?.(appointment.id)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
