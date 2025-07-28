"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import BookingForm from "@/components/appointments/booking-form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Clock } from "lucide-react"
import type { Doctor } from "@/types"
import ProfileCard from "@/components/profile/ProfileCard"

export default function NewAppointmentPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      router.push("/login")
      return
    }
    fetchDoctors()
  }, [])

  const fetchDoctors = async () => {
    try {
      const response = await fetch("/api/doctors")
      if (response.ok) {
        const data = await response.json()
        setDoctors(data.doctors)
      }
    } catch (error) {
      console.error("Error fetching doctors:", error)
    } finally {
      setLoading(false)
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Book New Appointment</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Doctor Selection */}
          <div className="space-y-6 max-w-xs">
            <h2 className="text-xl font-semibold">Select a Doctor</h2>
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`cursor-pointer transition-all w-full ${
                  selectedDoctor?.id === doctor.id ? "ring-2 ring-blue-500 bg-blue-50" : "hover:shadow-md"
                } rounded-2xl mb-4`}
                style={{ maxWidth: 320 }}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <ProfileCard
                  name={doctor.name}
                  subtitle={doctor.specialization}
                  photo={doctor.photo}
                  stats={[
                    { icon: <span className="text-green-600 font-bold">₹</span>, value: doctor.consultationFee },
                  ]}
                  className="w-full"
                />
              </div>
            ))}
          </div>

          {/* Booking Form */}
          <div className="lg:sticky lg:top-8">
            {selectedDoctor ? (
              <BookingForm doctor={selectedDoctor} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Doctor</h3>
                  <p className="text-gray-600">Choose a doctor from the list to book your appointment</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
