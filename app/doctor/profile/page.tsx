"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Avatar } from "@/components/ui/avatar"
import { User as UserIcon, UploadCloud } from "lucide-react"

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState({
    name: "",
    specialization: "",
    consultationFee: 0,
    about: "",
    photo: "",
  })
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Fee dialog state
  const [feeDialogOpen, setFeeDialogOpen] = useState(false)
  const [feeInput, setFeeInput] = useState(0)
  const [feeLoading, setFeeLoading] = useState(false)
  const [feeError, setFeeError] = useState("")

  // Keep feeInput in sync with profile
  useEffect(() => {
    setFeeInput(profile.consultationFee)
  }, [profile.consultationFee])

  const handleFeeUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeeLoading(true)
    setFeeError("")
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ consultationFee: feeInput }),
      })
      const data = await res.json()
      if (res.ok) {
        setProfile((prev) => ({ ...prev, consultationFee: feeInput }))
        setFeeDialogOpen(false)
      } else {
        setFeeError(data.error || "Failed to update fee")
      }
    } catch (e) {
      setFeeError("Network error")
    } finally {
      setFeeLoading(false)
    }
  }

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)
      setError("")
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("/api/doctor/profile", {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        if (res.ok) {
          setProfile({
            name: data.doctor.name || "",
            specialization: data.doctor.specialization || "",
            consultationFee: data.doctor.consultationFee || 0,
            about: data.doctor.about || "",
            photo: data.doctor.photo || "",
          })
          setAvatarPreview(data.doctor.photo || "")
        } else {
          setError(data.error || "Failed to fetch profile")
        }
      } catch (e) {
        setError("Network error")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)
    try {
      let photoUrl = profile.photo
      if (avatarFile) {
        // Simulate upload: in real app, upload to S3 or server and get URL
        // For now, just use base64 preview
        photoUrl = avatarPreview
      }
      const token = localStorage.getItem("token")
      const res = await fetch("/api/doctor/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...profile, photo: photoUrl }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess("Profile updated successfully!")
        setProfile((prev) => ({ ...prev, photo: photoUrl }))
      } else {
        setError(data.error || "Failed to update profile")
      }
    } catch (e) {
      setError("Network error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center py-12 px-2">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center relative">
        <div className="relative mb-4">
          <Avatar className="h-32 w-32 border-4 border-blue-200 shadow-lg">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Profile"
                className="object-cover h-full w-full rounded-full"
              />
            ) : (
              <UserIcon className="h-16 w-16 text-gray-400 mx-auto my-auto" />
            )}
          </Avatar>
          <button
            type="button"
            className="absolute bottom-2 right-2 bg-blue-600 text-white rounded-full p-2 shadow hover:bg-blue-700 transition"
            onClick={() => fileInputRef.current?.click()}
            title="Change profile picture"
          >
            <UploadCloud className="h-6 w-6" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-1">{profile.name || "Doctor Name"}</h2>
          <div className="text-blue-600 font-semibold text-lg mb-1">{profile.specialization || "Designation"}</div>
          <div className="text-gray-500 text-base">{profile.about || "Add a short bio about yourself."}</div>
        </div>
        <div className="flex flex-col items-center w-full">
          <form onSubmit={handleSubmit} className="w-full max-w-lg space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block font-medium mb-1">Name</label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="specialization" className="block font-medium mb-1">Designation</label>
                <Input
                  id="specialization"
                  name="specialization"
                  value={profile.specialization}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="consultationFee" className="block font-medium mb-1">Consultation Fee (INR)</label>
                <Input
                  id="consultationFee"
                  name="consultationFee"
                  type="number"
                  min={0}
                  value={profile.consultationFee}
                  readOnly
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <Button type="button" variant="outline" onClick={() => setFeeDialogOpen(true)}>
                Edit
              </Button>
            </div>
            <Dialog open={feeDialogOpen} onOpenChange={setFeeDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Consultation Fee</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    type="number"
                    min={0}
                    value={feeInput}
                    onChange={e => setFeeInput(Number(e.target.value))}
                    required
                  />
                  {feeError && <div className="text-red-600 text-center">{feeError}</div>}
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setFeeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="button" disabled={feeLoading} onClick={handleFeeUpdate}>
                      {feeLoading ? "Saving..." : "Update Fee"}
                    </Button>
                  </DialogFooter>
                </div>
              </DialogContent>
            </Dialog>
            <div>
              <label htmlFor="about" className="block font-medium mb-1">About</label>
              <textarea
                id="about"
                name="about"
                className="w-full border rounded p-2 min-h-[80px]"
                rows={4}
                value={profile.about}
                onChange={handleChange}
              />
            </div>
            <div className="flex justify-center">
              <Button type="submit" className="px-8 py-2 text-base font-semibold" disabled={loading}>
                {loading ? "Saving..." : "Update Profile"}
              </Button>
            </div>
            {success && <div className="text-green-600 text-center">{success}</div>}
            {error && <div className="text-red-600 text-center">{error}</div>}
          </form>
        </div>
      </div>
    </div>
  )
}
