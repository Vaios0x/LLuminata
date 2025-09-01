import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps {
  value?: number;
  className?: string;
  [key: string]: any;
}

const Progress: React.FC<ProgressProps> = ({ className, value = 0, ...props }) => (
  <div
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <div
      className="h-full w-full flex-1 bg-primary transition-all"
      style={{ 
        width: `${Math.min(Math.max(value, 0), 100)}%`,
        transform: 'translateX(0)'
      }}
    />
  </div>
)

export { Progress }
