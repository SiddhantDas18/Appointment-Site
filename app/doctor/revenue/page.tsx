"use client"
import { useEffect, useState } from "react"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Clock, CheckCircle, XCircle, Calendar } from "lucide-react"

interface RevenueData {
  confirmedRevenue: number
  pendingRevenue: number
  appointments: {
    id: string
    date: string
    time: string
    amount: number
    status: string
    paymentStatus: string
    user: { name: string }
  }[]
}

export default function DoctorRevenuePage() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchRevenue()
  }, [])

  const fetchRevenue = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/doctor/revenue", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await res.json()
      if (res.ok) {
        setData(result)
      } else {
        setError(result.error || "Failed to fetch revenue")
      }
    } catch (e) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`/api/doctor/appointments/${appointmentId}/complete`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        fetchRevenue()
      } else {
        setError("Failed to complete appointment")
      }
    } catch (e) {
      setError("Network error")
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading revenue data...</p>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Revenue Dashboard</h1>
        <p className="text-gray-600">Track your confirmed and pending revenue</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmed Revenue</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{data.confirmedRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From completed appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">₹{data.pendingRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From booked appointments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointments & Revenue</CardTitle>
        </CardHeader>
        <CardContent>
          {data.appointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {data.appointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-medium">{appointment.user.name}</p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(appointment.date), "MMM dd, yyyy")} at {appointment.time}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={appointment.status === "COMPLETED" ? "default" : 
                                     appointment.status === "CANCELLED" ? "destructive" : "secondary"}>
                          {appointment.status}
                        </Badge>
                        <Badge variant={appointment.paymentStatus === "PAID" ? "default" : 
                                     appointment.paymentStatus === "REFUNDED" ? "destructive" : "outline"}>
                          {appointment.paymentStatus}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">₹{appointment.amount}</p>
                      <p className="text-xs text-gray-500">
                        {appointment.status === "COMPLETED" ? "Confirmed" : "Pending"}
                      </p>
                    </div>
                    {appointment.status === "BOOKED" && appointment.paymentStatus === "PAID" && (
                      <Button
                        size="sm"
                        onClick={() => handleCompleteAppointment(appointment.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
}