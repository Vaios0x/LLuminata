import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  trend?: {
    value: string
    isPositive: boolean
    label: string
  }
  progress?: {
    current: number
    total: number
  }
  streak?: {
    current: number
    max: number
  }
  className?: string
  color?: "blue" | "green" | "purple" | "orange"
}

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  trend, 
  progress, 
  streak, 
  className,
  color = "blue" 
}: StatCardProps) {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600", 
    purple: "text-purple-600",
    orange: "text-orange-600"
  }

  return (
    <Card className={cn(
      "bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300",
      className
    )}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("text-3xl font-bold", colorClasses[color])}>
          {value}
        </div>
        
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}

        {progress && (
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            ></div>
          </div>
        )}

        {streak && (
          <div className="flex mt-2">
            {[...Array(streak.max)].map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full mr-1",
                  i < streak.current ? 'bg-green-500' : 'bg-gray-300'
                )}
              ></div>
            ))}
          </div>
        )}

        {trend && (
          <div className="flex items-center mt-2">
            <span className={cn(
              "text-sm",
              trend.isPositive ? "text-green-500" : "text-red-500"
            )}>
              {trend.value}
            </span>
            <span className="text-gray-500 text-xs ml-1">{trend.label}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
