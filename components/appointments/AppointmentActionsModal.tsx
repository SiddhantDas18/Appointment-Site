"use client"
import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Calendar, X } from "lucide-react"

interface AppointmentActionsModalProps {
  open: boolean
  onClose: () => void
  appointmentId: string
  appointmentDate: string
  appointmentTime: string
  doctorName: string
  onCancel: (id: string) => void
  onReschedule: (id: string, reason: string) => void
}

export default function AppointmentActionsModal({
  open,
  onClose,
  appointmentId,
  appointmentDate,
  appointmentTime,
  doctorName,
  onCancel,
  onReschedule,
}: AppointmentActionsModalProps) {
  const [action, setAction] = useState<"" | "cancel" | "reschedule">("")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)

  const handleAction = async () => {
    if (!action) return

    setLoading(true)
    try {
      if (action === "cancel") {
        await onCancel(appointmentId)
      } else if (action === "reschedule" && reason.trim()) {
        await onReschedule(appointmentId, reason.trim())
      }
      onClose()
      setAction("")
      setReason("")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setAction("")
    setReason("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={resetModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Appointment</DialogTitle>
        </DialogHeader>
        
        {!action && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-900">Appointment Details</p>
              <p className="text-blue-700">Dr. {doctorName}</p>
              <p className="text-blue-700">{appointmentDate} at {appointmentTime}</p>
            </div>
            
            <div className="space-y-3">
              <Button
                onClick={() => setAction("reschedule")}
                variant="outline"
                className="w-full justify-start"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Request Reschedule
              </Button>
              
              <Button
                onClick={() => setAction("cancel")}
                variant="outline"
                className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel Appointment
              </Button>
            </div>
          </div>
        )}

        {action === "reschedule" && (
          <div className="space-y-4">
            <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium">Reschedule Request</p>
                <p>Your request will be sent to the doctor for approval. You'll be notified once they respond.</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Reason for reschedule</label>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rescheduling..."
                className="min-h-[80px]"
                maxLength={500}
              />
              <p className="text-xs text-gray-500 mt-1">{reason.length}/500 characters</p>
            </div>
          </div>
        )}

        {action === "cancel" && (
          <div className="space-y-4">
            <div className="flex items-start space-x-2 p-3 bg-red-50 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium">Cancel Appointment</p>
                <p>Are you sure you want to cancel this appointment? A refund will be processed if applicable.</p>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col gap-2 mt-4">
          {action && (
            <>
              <Button
                onClick={handleAction}
                disabled={loading || (action === "reschedule" && !reason.trim())}
                className="w-full"
                variant={action === "cancel" ? "destructive" : "default"}
              >
                {loading ? "Processing..." : action === "cancel" ? "Confirm Cancellation" : "Send Request"}
              </Button>
              <Button onClick={() => setAction("")} variant="outline" className="w-full" disabled={loading}>
                Back
              </Button>
            </>
          )}
          {!action && (
            <Button onClick={resetModal} variant="outline" className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
