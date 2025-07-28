"use client"
import { useEffect, useState } from "react"
import { addDays, format } from "date-fns"
import { generateTimeSlots } from "@/lib/time-utils"
import { Availability } from "@/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Plus, Calendar, Clock } from "lucide-react"

export default function DoctorAvailabilityPage() {
  const [slots, setSlots] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [date, setDate] = useState("")
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [newTime, setNewTime] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function fetchAvailability() {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("/api/doctor/availability", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setSlots(data.availabilities as Availability[])
        } else {
          setError(data.error || "Failed to fetch availability")
        }
      } catch (e) {
        setError("Network error")
      } finally {
        setLoading(false)
      }
    }
    fetchAvailability()
  }, [])

  const today = new Date()
  const maxDate = addDays(today, 13)

  const handleAddTimeSlot = () => {
    if (newTime && !timeSlots.includes(newTime)) {
      setTimeSlots([...timeSlots, newTime])
      setNewTime("")
    }
  }

  const handleRemoveTimeSlot = (time: string) => {
    setTimeSlots(timeSlots.filter((t) => t !== time))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!date || timeSlots.length === 0) return
    setSubmitting(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/doctor/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date, timeSlots }),
      })
      const data = await res.json()
      if (res.ok) {
        setSlots([...slots, data.availability as Availability])
        setDate("")
        setTimeSlots([])
      } else {
        setError(data.error || "Failed to add availability")
      }
    } catch (e) {
      setError("Network error")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/doctor/availability?id=${slotId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setSlots(slots.filter((slot) => slot.id !== slotId))
      } else {
        setError("Failed to delete slot")
      }
    } catch (e) {
      setError("Network error")
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Availability</h1>
        <p className="text-gray-600">Set your available time slots for the next 2 weeks</p>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Availability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="date" className="text-sm font-medium">
                Select Date (next 2 weeks)
              </Label>
              <div className="mt-1 relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  min={format(today, "yyyy-MM-dd")}
                  max={format(maxDate, "yyyy-MM-dd")}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Select Time Slots</Label>
              <div className="mt-2 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                {generateTimeSlots("08:00", "20:00", 30).map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    className={`px-3 py-2 rounded border text-sm font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      timeSlots.includes(slot)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-800 border-gray-300 hover:bg-blue-50"
                    }`}
                    onClick={() =>
                      timeSlots.includes(slot)
                        ? setTimeSlots(timeSlots.filter((t) => t !== slot))
                        : setTimeSlots([...timeSlots, slot])
                    }
                  >
                    {slot}
                  </button>
                ))}
              </div>
              {timeSlots.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 mb-2">Selected time slots:</p>
                  <div className="flex flex-wrap gap-2">
                    {timeSlots.map((time) => (
                      <Badge key={time} variant="secondary" className="px-3 py-1">
                        {time}
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeSlot(time)}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>


            <Button
              type="submit"
              className="w-full"
              disabled={submitting || !date || timeSlots.length === 0}
            >
              {submitting ? "Adding..." : "Add Availability"}
            </Button>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Available Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading availability...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No availability slots added yet</p>
              <p className="text-sm text-gray-500 mt-1">Add your first availability slot above</p>
            </div>
          ) : (
            <div className="space-y-4">
              {slots.map((slot) => (
                <div key={slot.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-lg text-gray-900">
                        {format(new Date(slot.date), "EEEE, MMMM dd, yyyy")}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {slot.timeSlots.map((time) => (
                          <Badge key={time} variant="outline">
                            {time}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteSlot(slot.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
