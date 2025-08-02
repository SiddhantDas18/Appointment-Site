"use client"
import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle } from "lucide-react"

interface RescheduleReasonModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string) => void
  loading?: boolean
  appointmentDate: string
  appointmentTime: string
  doctorName: string
}

export default function RescheduleReasonModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  appointmentDate,
  appointmentTime,
  doctorName,
}: RescheduleReasonModalProps) {
  const [reason, setReason] = useState("")

  const handleSubmit = () => {
    if (!reason.trim()) return
    onSubmit(reason.trim())
    setReason("")
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Reschedule</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="font-medium text-blue-900">Current Appointment</p>
            <p className="text-blue-700">Dr. {doctorName}</p>
            <p className="text-blue-700">{appointmentDate} at {appointmentTime}</p>
          </div>

          <div className="flex items-start space-x-2 p-3 bg-yellow-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Reschedule Request</p>
              <p>Your request will be sent to the doctor for approval. You'll be notified once they respond.</p>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Reason for reschedule *</label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please provide a reason for rescheduling your appointment..."
              className="min-h-[100px]"
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">{reason.length}/500 characters</p>
          </div>
        </div>

        <DialogFooter className="flex flex-col gap-2 mt-4">
          <Button
            onClick={handleSubmit}
            disabled={loading || !reason.trim()}
            className="w-full"
          >
            {loading ? "Sending Request..." : "Send Reschedule Request"}
          </Button>
          <Button onClick={handleClose} variant="outline" className="w-full" disabled={loading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
