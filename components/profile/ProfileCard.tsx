import { User as UserIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProfileCardProps {
  name: string
  subtitle?: string
  photo?: string
  stats?: { icon: React.ReactNode; value: number | string }[]
  className?: string
}

export default function ProfileCard({
  name,
  subtitle,
  photo,
  stats = [],
  className = "",
}: ProfileCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-3xl p-8 flex flex-col items-center w-full max-w-sm mx-auto",
        "shadow-[0_4px_20px_0_rgba(0,0,0,0.08)] border border-gray-100",
        className
      )}
    >
      {/* Large Profile Image */}
      <div className="w-36 h-36 rounded-3xl overflow-hidden mb-6 bg-gray-100 flex items-center justify-center">
        {photo ? (
          <img
            src={photo}
            alt={name}
            className="object-cover w-full h-full"
            draggable={false}
          />
        ) : (
          <UserIcon className="h-16 w-16 text-gray-300" />
        )}
      </div>
      
      {/* Name */}
      <h3 className="text-2xl font-bold text-gray-900 mb-2 text-center">{name}</h3>
      
      {/* Subtitle/Description */}
      {subtitle && (
        <p className="text-gray-500 text-base text-center mb-6 leading-relaxed max-w-xs">
          {subtitle}
        </p>
      )}
      
      {/* Stats */}
      {stats.length > 0 && (
        <div className="flex items-center gap-8 text-gray-700">
          {stats.map((stat, i) => (
            <div key={i} className="flex items-center gap-1.5 text-base font-medium">
              {stat.icon}
              <span>{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
