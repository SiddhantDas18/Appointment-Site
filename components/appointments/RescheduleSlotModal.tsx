import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"

interface RescheduleSlotModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (date: Date, slot: string) => void
  loading?: boolean
  initialDate: Date
  initialSlot: string
  availableSlots: string[]
}

export default function RescheduleSlotModal({
  open,
  onClose,
  onSubmit,
  loading = false,
  initialDate,
  initialSlot,
  availableSlots,
}: RescheduleSlotModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate)
  const [selectedSlot, setSelectedSlot] = useState<string>(initialSlot)
  const [localSlots, setLocalSlots] = useState<string[]>(availableSlots)
  const [loadingSlots, setLoadingSlots] = useState(false)

  // Update state when props change
  useEffect(() => {
    setSelectedDate(initialDate)
    setSelectedSlot(initialSlot)
    setLocalSlots(availableSlots)
  }, [initialDate, initialSlot, availableSlots])

  const fetchSlotsForDate = async (date: Date) => {
    setLoadingSlots(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/doctor/availability`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        const dateStr = date.toISOString().slice(0, 10)
        const found = (data.availabilities || []).find((a: any) => {
          const availDate = new Date(a.date).toISOString().slice(0, 10)
          return availDate === dateStr
        })
        setLocalSlots(found ? found.timeSlots : [])
        setSelectedSlot("") // Reset slot selection when date changes
      } else {
        setLocalSlots([])
      }
    } catch {
      setLocalSlots([])
    } finally {
      setLoadingSlots(false)
    }
  }

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date)
      fetchSlotsForDate(date)
    }
  }

  const handleSubmit = () => {
    if (!selectedSlot) return
    
    // Check if trying to reschedule to the same date and time
    const isSameDate = selectedDate.toISOString().split('T')[0] === initialDate.toISOString().split('T')[0]
    const isSameSlot = selectedSlot === initialSlot
    
    if (isSameDate && isSameSlot) {
      alert("Cannot reschedule to the same date and time. Please select a different slot.")
      return
    }
    
    onSubmit(selectedDate, selectedSlot)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Select Date</label>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              required={true}
              className="rounded-md border"
              disabled={(date) => date < new Date() || date > new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Select Slot</label>
            {loadingSlots ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading slots...</span>
              </div>
            ) : localSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {localSlots.map((slot) => {
                  const isSameDate = selectedDate.toISOString().split('T')[0] === initialDate.toISOString().split('T')[0]
                  const isCurrentSlot = isSameDate && slot === initialSlot
                  const isSelected = selectedSlot === slot
                  
                  return (
                    <Button
                      key={slot}
                      variant={isSelected ? "default" : "outline"}
                      onClick={() => setSelectedSlot(slot)}
                      size="sm"
                      className={isCurrentSlot ? "border-yellow-500 bg-yellow-50 text-yellow-800" : ""}
                      title={isCurrentSlot ? "Current appointment time" : ""}
                    >
                      {slot} {isCurrentSlot && "(Current)"}
                    </Button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4">No slots available for this date</p>
            )}
          </div>
        </div>
        <DialogFooter className="flex flex-col gap-2 mt-4">
          <Button onClick={handleSubmit} disabled={loading || !selectedSlot} className="w-full">
            {loading ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
          <Button onClick={onClose} variant="outline" className="w-full" disabled={loading}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
