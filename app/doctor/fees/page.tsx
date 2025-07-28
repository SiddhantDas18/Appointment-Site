"use client"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function UpdateConsultationFee() {
  const [fee, setFee] = useState(0)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    // Fetch current doctor's fee
    async function fetchFee() {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("/api/doctor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setFee(data.doctor.consultationFee)
        } else {
          setError(data.error || "Failed to fetch fee")
        }
      } catch (e) {
        setError("Network error")
      } finally {
        setLoading(false)
      }
    }
    fetchFee()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ consultationFee: fee }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess("Consultation fee updated successfully!")
      } else {
        setError(data.error || "Failed to update fee")
      }
    } catch (e) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Update Consultation Fee</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="fee" className="block font-medium mb-1">Consultation Fee (INR)</label>
          <Input
            id="fee"
            type="number"
            min={0}
            value={fee}
            onChange={e => setFee(Number(e.target.value))}
            required
          />
        </div>
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Update Fee"}</Button>
        {success && <div className="text-green-600">{success}</div>}
        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  )
}
