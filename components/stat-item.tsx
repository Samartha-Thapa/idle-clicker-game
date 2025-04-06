import type { ReactNode } from "react"

interface StatItemProps {
  icon: ReactNode
  label: string
  value: string
}

export function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
        {icon}
        <span>{label}</span>
      </div>
      <div className="font-medium">{value}</div>
    </div>
  )
}

