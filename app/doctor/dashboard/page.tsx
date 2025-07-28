"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CalendarDays, Clock, Users, Settings, Plus, Eye } from "lucide-react"

export default function DoctorDashboard() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState({
    appointments: 0,
    availableSlots: 0,
    todaysAppointments: 0,
  })

  useEffect(() => {
    // Get user from localStorage
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }

    // Fetch dashboard stats
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      
      // Fetch appointments count
      const appointmentsRes = await fetch("/api/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      
      // Fetch availability count
      const availabilityRes = await fetch("/api/doctor/availability", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (appointmentsRes.ok) {
        const appointmentsData = await appointmentsRes.json()
        const today = new Date().toDateString()
        const todaysCount = appointmentsData.appointments.filter((apt: any) => 
          new Date(apt.date).toDateString() === today
        ).length

        setStats(prev => ({
          ...prev,
          appointments: appointmentsData.appointments.length,
          todaysAppointments: todaysCount,
        }))
      }

      if (availabilityRes.ok) {
        const availabilityData = await availabilityRes.json()
        setStats(prev => ({
          ...prev,
          availableSlots: availabilityData.availabilities.length,
        }))
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Welcome back, {user?.name || "Doctor"}!
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/doctor/appointments">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Link>
              </Button>
              <Button asChild>
                <Link href="/doctor/availability">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slots
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.appointments}</div>
              <p className="text-xs text-muted-foreground">All time appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todaysAppointments}</div>
              <p className="text-xs text-muted-foreground">Scheduled for today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.availableSlots}</div>
              <p className="text-xs text-muted-foreground">Days with availability</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Manage Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                View and manage all your patient appointments, update statuses, and track payments.
              </p>
              <Button asChild className="w-full">
                <Link href="/doctor/appointments">
                  <Eye className="h-4 w-4 mr-2" />
                  View Appointments
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Manage Availability
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Set your available time slots for the next 2 weeks and manage your schedule.
              </p>
              <Button asChild className="w-full">
                <Link href="/doctor/availability">
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Availability
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
