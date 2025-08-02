"use client"
import { useEffect, useState } from "react"
import { Appointment } from "@/types"
import AppointmentCard from "@/components/appointments/appointment-card"
import RescheduleSlotModal from "@/components/appointments/RescheduleSlotModal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDays, Users, Clock, DollarSign, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isRescheduleModalOpen, setIsRescheduleModalOpen] = useState(false)

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/doctor/appointments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) {
        setAppointments(data.appointments)
      } else {
        setError(data.error || "Failed to fetch appointments")
      }
    } catch (e) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  const handleRescheduleApproval = async (appointmentId: string, newDate: string, newTime: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/doctor/appointments/${appointmentId}/reschedule`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: newDate, time: newTime }),
      })

      if (response.ok) {
        await fetchAppointments()
        setIsRescheduleModalOpen(false)
        setSelectedAppointment(null)
      } else {
        const data = await response.json()
        console.error("Failed to reschedule:", data.error)
      }
    } catch (error) {
      console.error("Error rescheduling appointment:", error)
    }
  }

  const handleMarkCompleted = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/doctor/appointments/${appointmentId}/complete`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchAppointments()
      } else {
        const data = await response.json()
        console.error("Failed to mark as completed:", data.error)
      }
    } catch (error) {
      console.error("Error marking appointment as completed:", error)
    }
  }

  const filterAppointments = (status?: string) => {
    if (!status || status === 'all') return appointments
    if (status === 'reschedule-requests') return appointments.filter(apt => apt.isRescheduleRequested)
    return appointments.filter(apt => apt.status === status)
  }

  const stats = {
    total: appointments.length,
    booked: appointments.filter((a) => a.status === "BOOKED").length,
    completed: appointments.filter((a) => a.status === "COMPLETED").length,
    cancelled: appointments.filter((a) => a.status === "CANCELLED").length,
    rescheduleRequests: appointments.filter((a) => a.isRescheduleRequested).length,
    revenue: appointments
      .filter((a) => a.paymentStatus === "PAID")
      .reduce((sum, a) => sum + a.amount, 0),
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Appointments</h1>
        <p className="text-gray-600">Manage and track your patient appointments</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CalendarDays className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Booked</p>
                <p className="text-2xl font-bold text-gray-900">{stats.booked}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Cancelled</p>
                <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Reschedule</p>
                <p className="text-2xl font-bold text-gray-900">{stats.rescheduleRequests}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-emerald-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats.revenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Appointments List */}
      {loading ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading appointments...</p>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">{error}</p>
            </div>
          </CardContent>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="p-8">
            <div className="text-center">
              <CalendarDays className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No appointments found</p>
              <p className="text-sm text-gray-500 mt-1">Appointments will appear here once patients book</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="BOOKED">Booked</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
            <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
            <TabsTrigger value="reschedule-requests">
              Reschedule Requests
              {stats.rescheduleRequests > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 text-xs">
                  {stats.rescheduleRequests}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>All Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <AppointmentCard
                        appointment={appointment}
                        showActions={false}
                        className="border-0 shadow-none"
                      />
                      <div className="flex space-x-2">
                        {appointment.status === 'BOOKED' && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkCompleted(appointment.id)}
                          >
                            Mark Complete
                          </Button>
                        )}
                        {appointment.isRescheduleRequested && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedAppointment(appointment)
                              setIsRescheduleModalOpen(true)
                            }}
                          >
                            Reschedule
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="BOOKED" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Booked Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterAppointments('BOOKED').map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <AppointmentCard
                        appointment={appointment}
                        showActions={false}
                        className="border-0 shadow-none"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleMarkCompleted(appointment.id)}
                      >
                        Mark Complete
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="COMPLETED" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Completed Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterAppointments('COMPLETED').map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      showActions={false}
                      className="border rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="CANCELLED" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cancelled Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterAppointments('CANCELLED').map((appointment) => (
                    <AppointmentCard
                      key={appointment.id}
                      appointment={appointment}
                      showActions={false}
                      className="border rounded-lg"
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reschedule-requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Reschedule Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filterAppointments('reschedule-requests').map((appointment) => (
                    <div key={appointment.id} className="p-4 border rounded-lg bg-orange-50">
                      <AppointmentCard
                        appointment={appointment}
                        showActions={false}
                        className="border-0 shadow-none bg-transparent"
                      />
                      {appointment.rescheduleReason && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <p className="text-sm text-gray-600">
                            <strong>Reason:</strong> {appointment.rescheduleReason}
                          </p>
                        </div>
                      )}
                      <div className="mt-3 flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedAppointment(appointment)
                            setIsRescheduleModalOpen(true)
                          }}
                        >
                          Approve & Reschedule
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Reschedule Modal */}
      {selectedAppointment && (
        <RescheduleSlotModal
          open={isRescheduleModalOpen}
          onClose={() => {
            setIsRescheduleModalOpen(false)
            setSelectedAppointment(null)
          }}
          onSubmit={(date: Date, slot: string) => {
            const dateStr = date.toISOString().split('T')[0]
            handleRescheduleApproval(selectedAppointment.id, dateStr, slot)
          }}
          initialDate={new Date(selectedAppointment.date)}
          initialSlot={selectedAppointment.time}
          availableSlots={[]} // Will be fetched dynamically
        />
      )}
    </div>
  )
}
