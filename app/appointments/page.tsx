"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppointmentCard from "@/components/appointments/appointment-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Calendar } from "lucide-react"
import type { Appointment } from "@/types"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        router.push("/login")
        return
      }

      const response = await fetch("/api/appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAppointments(data.appointments)
      } else {
        console.error("Failed to fetch appointments")
      }
    } catch (error) {
      console.error("Error fetching appointments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment? You will receive a refund.")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        alert("Appointment cancelled successfully. Refund will be processed.")
        fetchAppointments()
      } else {
        const data = await response.json()
        alert("Failed to cancel appointment: " + data.error)
      }
    } catch (error) {
      alert("Error cancelling appointment")
    }
  }

  const handleReschedule = async (appointmentId: string) => {
    const reason = prompt("Please provide a reason for rescheduling:")
    if (!reason) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/appointments/${appointmentId}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ reason }),
      })

      if (response.ok) {
        alert("Reschedule request sent to doctor.")
        fetchAppointments()
      } else {
        const data = await response.json()
        alert("Failed to request reschedule: " + data.error)
      }
    } catch (error) {
      alert("Error requesting reschedule")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <Button onClick={() => router.push("/appointments/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Book New Appointment
          </Button>
        </div>

        {appointments.length === 0 ? (
          <Card className="text-center py-12">
            <CardHeader>
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <CardTitle>No Appointments Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                You haven't booked any appointments yet. Start by booking your first appointment.
              </p>
              <Button onClick={() => router.push("/appointments/new")}>Book Your First Appointment</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onCancel={handleCancel}
                onReschedule={handleReschedule}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
