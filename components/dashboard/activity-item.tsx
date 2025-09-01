import { cn } from "@/lib/utils"

interface ActivityItemProps {
  type: "lesson" | "quiz" | "achievement"
  title: string
  progress?: number
  score?: number
  time: string
}

export function ActivityItem({ type, title, progress, score, time }: ActivityItemProps) {
  const getIcon = () => {
    switch (type) {
      case "lesson":
        return "📚"
      case "quiz":
        return "📝"
      case "achievement":
        return "🏆"
      default:
        return "📚"
    }
  }

  const getIconBg = () => {
    switch (type) {
      case "lesson":
        return "bg-blue-100 text-blue-600"
      case "quiz":
        return "bg-green-100 text-green-600"
      case "achievement":
        return "bg-purple-100 text-purple-600"
      default:
        return "bg-blue-100 text-blue-600"
    }
  }

  const getDescription = () => {
    switch (type) {
      case "lesson":
        return `Progreso: ${progress}%`
      case "quiz":
        return `Puntuación: ${score}%`
      case "achievement":
        return "¡Logro desbloqueado!"
      default:
        return ""
    }
  }

  return (
    <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", getIconBg())}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900 dark:text-white">
          {title}
        </h4>
        <p className="text-sm text-gray-500">
          {getDescription()}
        </p>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  )
}
