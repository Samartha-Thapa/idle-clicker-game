"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"
import type { Upgrade } from "@/hooks/use-cookie-game"

interface UpgradeItemProps {
  upgrade: Upgrade
  cookies: number
  onBuy: () => void
  canAfford: boolean
  
}
export function UpgradeItem({ upgrade, cookies, onBuy, canAfford }: UpgradeItemProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return num.toString()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex-shrink-0">{upgrade.icon}</div>
          <div>
            <div className="font-medium">{upgrade.name}</div>
            <div className="text-xs text-muted-foreground">Level {upgrade.level}</div>
          </div>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Info className="h-4 w-4" />
                <span className="sr-only">Info</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{upgrade.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {upgrade.type === "click"
            ? "+" + formatNumber(upgrade.value) + " per click"
            : "+" + formatNumber(upgrade.value) + " per second"}
        </div>
        <Button
          size="sm"
          variant={canAfford ? "default" : "outline"}
          onClick={onBuy}
          disabled={!canAfford}
          className={!canAfford ? "opacity-70" : ""}
        >
          {formatNumber(upgrade.cost)}
        </Button>
      </div>
      <Separator />
    </div>
  )
}

