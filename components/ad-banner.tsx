"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"

interface AdBannerProps {
  variant?: "horizontal" | "vertical"
}

export function AdBanner({ variant = "horizontal" }: AdBannerProps) {
  const [adIndex, setAdIndex] = useState(0)

  // Rotate ads every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setAdIndex((prev) => (prev + 1) % adContent.length)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  const adContent = [
    {
      title: "Premium Upgrades",
      description: "Boost your cookie production!",
      color: "from-amber-400 to-amber-600",
    },
    {
      title: "Cookie Deluxe",
      description: "Unlock special cookies and bonuses!",
      color: "from-emerald-400 to-emerald-600",
    },
    {
      title: "Cookie Clicker Pro",
      description: "Double your cookie production!",
      color: "from-sky-400 to-sky-600",
    },
  ]

  const currentAd = adContent[adIndex]

  if (variant === "vertical") {
    return (
      <Card className="relative overflow-hidden h-64 flex flex-col items-center justify-center text-white cursor-pointer hover:opacity-95 transition-opacity">
        <div className={`absolute inset-0 bg-gradient-to-br ${currentAd.color}`}></div>
        <div className="relative z-10 p-4 text-center">
          <div className="text-xs uppercase tracking-wider mb-1 opacity-80">Advertisement</div>
          <h3 className="font-bold text-lg mb-2">{currentAd.title}</h3>
          <p className="text-sm mb-4">{currentAd.description}</p>
          <div className="flex items-center justify-center text-xs gap-1 opacity-80">
            <ExternalLink className="h-3 w-3" />
            <span>Click to learn more</span>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="relative overflow-hidden h-20 flex items-center justify-center text-white cursor-pointer hover:opacity-95 transition-opacity">
      <div className={`absolute inset-0 bg-gradient-to-r ${currentAd.color}`}></div>
      <div className="relative z-10 p-4 flex justify-between items-center w-full">
        <div>
          <div className="text-xs uppercase tracking-wider mb-1 opacity-80">Advertisement</div>
          <h3 className="font-bold">{currentAd.title}</h3>
        </div>
        <div className="text-right">
          <p className="text-sm">{currentAd.description}</p>
          <div className="flex items-center justify-end text-xs gap-1 opacity-80">
            <ExternalLink className="h-3 w-3" />
            <span>Click to learn more</span>
          </div>
        </div>
      </div>
    </Card>
  )
}

