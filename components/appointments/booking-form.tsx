"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, CreditCard } from "lucide-react"
import type { Doctor } from "@/types"

interface BookingFormProps {
  doctor: Doctor
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function BookingForm({ doctor }: BookingFormProps) {
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (selectedDate) {
      fetchAvailableSlots(selectedDate)
    }
  }, [selectedDate])

  const fetchAvailableSlots = async (date: string) => {
    try {
      const response = await fetch(`/api/availability?doctorId=${doctor.id}&date=${date}`)
      const data = await response.json()
      setAvailableSlots(data.timeSlots || [])
    } catch (error) {
      console.error("Error fetching slots:", error)
    }
  }

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select date and time")
      return
    }

    setLoading(true)

    try {
      // Create Razorpay order
      const orderResponse = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          amount: doctor.consultationFee,
          doctorId: doctor.id,
          date: selectedDate,
          time: selectedTime,
          notes,
        }),
      })

      const orderData = await orderResponse.json()

      if (!orderResponse.ok) {
        throw new Error(orderData.error)
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Healthcare Booking",
        description: `Consultation with ${doctor.name}`,
        order_id: orderData.order.id,
        handler: async (response: any) => {
          // Verify payment and create appointment
          const bookingResponse = await fetch("/api/appointments/book", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({
              doctorId: doctor.id,
              date: selectedDate,
              time: selectedTime,
              notes,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }),
          })

          const bookingData = await bookingResponse.json()

          if (bookingResponse.ok) {
            alert("Appointment booked successfully!")
            window.location.href = "/appointments"
          } else {
            alert("Booking failed: " + bookingData.error)
          }
        },
        prefill: {
          name: JSON.parse(localStorage.getItem("user") || "{}").name,
          email: JSON.parse(localStorage.getItem("user") || "{}").email,
        },
        theme: {
          color: "#2563eb",
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch (error) {
      console.error("Booking error:", error)
      alert("Booking failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Get next 30 days for date selection
  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date.toISOString().split("T")[0])
    }
    return dates
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book Appointment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="date">Select Date</Label>
          <select
            id="date"
            className="w-full p-2 border rounded-md"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          >
            <option value="">Choose a date</option>
            {getAvailableDates().map((date) => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </option>
            ))}
          </select>
        </div>

        {selectedDate && (
          <div className="space-y-2">
            <Label>Available Time Slots</Label>
            <div className="grid grid-cols-3 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot}
                  variant={selectedTime === slot ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTime(slot)}
                >
                  {slot}
                </Button>
              ))}
            </div>
            {availableSlots.length === 0 && <p className="text-sm text-gray-500">No slots available for this date</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Input
            id="notes"
            placeholder="Any specific concerns or notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="bg-gray-50 p-3 rounded-md">
          <div className="flex justify-between items-center">
            <span className="font-medium">Consultation Fee:</span>
            <span className="text-lg font-bold">₹{doctor.consultationFee}</span>
          </div>
        </div>

        <Button onClick={handleBooking} disabled={!selectedDate || !selectedTime || loading} className="w-full">
          {loading ? (
            "Processing..."
          ) : (
            <>
              <CreditCard className="h-4 w-4 mr-2" />
              Pay & Book Appointment
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
