"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AppointmentCard from "@/components/appointments/appointment-card"
import AppointmentActionsModal from "@/components/appointments/AppointmentActionsModal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import type { Appointment } from "@/types"

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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

  const openActionsModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setIsModalOpen(true)
  }

  const closeActionsModal = () => {
    setSelectedAppointment(null)
    setIsModalOpen(false)
  }

  const filterAppointments = (status?: string) => {
    if (!status || status === 'all') return appointments
    return appointments.filter(apt => apt.status === status)
  }

  const getAppointmentStats = () => {
    const booked = appointments.filter(apt => apt.status === 'BOOKED').length
    const completed = appointments.filter(apt => apt.status === 'COMPLETED').length
    const cancelled = appointments.filter(apt => apt.status === 'CANCELLED').length
    const rescheduled = appointments.filter(apt => apt.status === 'RESCHEDULED').length
    const rescheduleRequested = appointments.filter(apt => apt.isRescheduleRequested).length
    
    return { booked, completed, cancelled, rescheduled, rescheduleRequested, total: appointments.length }
  }

  const stats = getAppointmentStats()

  const handleCancel = async (appointmentId: string) => {
    // This will be handled by the AppointmentActionsModal
    const appointment = appointments.find(apt => apt.id === appointmentId)
    if (appointment) {
      openActionsModal(appointment)
    }
  }

  const handleReschedule = async (appointmentId: string) => {
    // This will be handled by the AppointmentActionsModal
    const appointment = appointments.find(apt => apt.id === appointmentId)
    if (appointment) {
      openActionsModal(appointment)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        await fetchAppointments()
        closeActionsModal()
      } else {
        const data = await response.json()
        console.error("Failed to cancel appointment:", data.error)
      }
    } catch (error) {
      console.error("Error cancelling appointment:", error)
    }
  }

  const handleRescheduleAppointment = async (appointmentId: string, reason: string) => {
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
        await fetchAppointments()
        closeActionsModal()
      } else {
        const data = await response.json()
        console.error("Failed to request reschedule:", data.error)
      }
    } catch (error) {
      console.error("Error requesting reschedule:", error)
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-semibold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Booked</p>
                  <p className="text-xl font-semibold">{stats.booked}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-xl font-semibold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm text-gray-600">Rescheduled</p>
                  <p className="text-xl font-semibold">{stats.rescheduled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Cancelled</p>
                  <p className="text-xl font-semibold">{stats.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
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
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="BOOKED">Booked</TabsTrigger>
              <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
              <TabsTrigger value="RESCHEDULED">Rescheduled</TabsTrigger>
              <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {appointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancel}
                    onReschedule={handleReschedule}
                    onOpenActions={() => openActionsModal(appointment)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="BOOKED" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterAppointments('BOOKED').map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancel}
                    onReschedule={handleReschedule}
                    onOpenActions={() => openActionsModal(appointment)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="COMPLETED" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterAppointments('COMPLETED').map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancel}
                    onReschedule={handleReschedule}
                    onOpenActions={() => openActionsModal(appointment)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="RESCHEDULED" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterAppointments('RESCHEDULED').map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancel}
                    onReschedule={handleReschedule}
                    onOpenActions={() => openActionsModal(appointment)}
                  />
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="CANCELLED" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filterAppointments('CANCELLED').map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    appointment={appointment}
                    onCancel={handleCancel}
                    onReschedule={handleReschedule}
                    onOpenActions={() => openActionsModal(appointment)}
                  />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* Appointment Actions Modal */}
        {selectedAppointment && (
          <AppointmentActionsModal
            open={isModalOpen}
            onClose={closeActionsModal}
            appointmentId={selectedAppointment.id}
            appointmentDate={new Date(selectedAppointment.date).toLocaleDateString()}
            appointmentTime={selectedAppointment.time}
            doctorName={selectedAppointment.doctor?.name || 'Unknown Doctor'}
            onCancel={(id) => {
              // Handle cancel logic here or create a separate function
              handleCancelAppointment(id)
            }}
            onReschedule={(id, reason) => {
              // Handle reschedule logic here or create a separate function
              handleRescheduleAppointment(id, reason)
            }}
          />
        )}
      </div>
    </div>
  )
}
