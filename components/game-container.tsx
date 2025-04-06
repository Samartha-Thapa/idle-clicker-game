"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Cookie, CookingPot, Cpu, Gauge, Plus, Zap, PlayCircle, Save, RotateCcw } from "lucide-react"
import { UpgradeItem } from "@/components/upgrade-item"
import { StatItem } from "@/components/stat-item"
import { useCookieGame } from "@/hooks/use-cookie-game"
import { AdBanner } from "@/components/ad-banner"
import { RewardedAdModal } from "@/components/rewarded-ad-modal"
import {
  AlertDialog,  
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function GameContainer() {
  const {
    cookies,
    cookiesPerClick,
    cookiesPerSecond,
    totalCookies,
    clickCookie,
    upgrades,
    buyUpgrade,
    canAffordUpgrade,
    formatNumber,
    addCookies,
    lastSaveTime,
    resetGame,
    saveGame,
  } = useCookieGame()

  const [isAdModalOpen, setIsAdModalOpen] = useState(false)
  const [adCooldown, setAdCooldown] = useState(0)
  const [showSaveIndicator, setShowSaveIndicator] = useState(false)

  // Ad cooldown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (adCooldown > 0) {
      timer = setInterval(() => {
        setAdCooldown((prev) => Math.max(0, prev - 1))
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [adCooldown])

  // Load ad cooldown from localStorage
  useEffect(() => {
    try {
      const savedCooldown = localStorage.getItem("adCooldown")
      if (savedCooldown) {
        const { cooldown, timestamp } = JSON.parse(savedCooldown)
        const elapsedSeconds = Math.floor((Date.now() - timestamp) / 1000)
        const remainingCooldown = Math.max(0, cooldown - elapsedSeconds)
        setAdCooldown(remainingCooldown)
      }
    } catch (error) {
      console.error("Error loading ad cooldown:", error)
    }
  }, [])

  // Save ad cooldown to localStorage
  useEffect(() => {
    try {
      if (adCooldown > 0) {
        localStorage.setItem(
          "adCooldown",
          JSON.stringify({
            cooldown: adCooldown,
            timestamp: Date.now(),
          }),
        )
      } else {
        localStorage.removeItem("adCooldown")
      }
    } catch (error) {
      console.error("Error saving ad cooldown:", error)
    }
  }, [adCooldown])

  // Show save indicator when game is saved
  useEffect(() => {
    if (lastSaveTime) {
      setShowSaveIndicator(true)
      const timer = setTimeout(() => {
        setShowSaveIndicator(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [lastSaveTime])

  const handleWatchAd = () => {
    setIsAdModalOpen(true)
  }

  const handleAdComplete = () => {
    setIsAdModalOpen(false)

    // Calculate reward based on current production
    const baseReward = Math.max(cookiesPerClick * 20, cookiesPerSecond * 30)
    const reward = Math.ceil(baseReward)

    // Add cookies
    addCookies(reward)

    // Set cooldown (5 minutes)
    setAdCooldown(300)
  }

  const handleManualSave = () => {
    saveGame()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <div className="w-full max-w-4xl grid gap-6 md:grid-cols-[1fr_300px]">
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl">Cookie Clicker</CardTitle>
                <CardDescription>Click the cookie to earn more cookies!</CardDescription>
              </div>
              <div className="flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={handleManualSave} className="relative">
                        <Save className="h-4 w-4" />
                        {showSaveIndicator && (
                          <span className="absolute -top-1 -right-1 h-2 w-2 bg-green-500 rounded-full animate-pulse" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Save Game</p>
                      {lastSaveTime && (
                        <p className="text-xs text-muted-foreground">Last saved: {lastSaveTime.toLocaleTimeString()}</p>
                      )}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Reset Game</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to reset your game? This will delete all your progress and cannot be
                        undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={resetGame} className="bg-destructive text-destructive-foreground">
                        Reset
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className="text-4xl font-bold text-amber-800">{formatNumber(cookies)} cookies</div>
            <div className="relative group">
              <button
                onClick={clickCookie}
                className="relative transition-all duration-100 active:scale-95 hover:scale-105 focus:outline-none"
                aria-label="Click to earn cookies"
              >
                <Cookie className="h-40 w-40 text-amber-600 drop-shadow-md" />
              </button>
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 opacity-0 group-active:opacity-100 transition-opacity pointer-events-none">
                <div className="text-amber-800 font-bold text-xl animate-float-up">+{cookiesPerClick}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full">
              <StatItem icon={<Plus className="h-4 w-4" />} label="Per Click" value={formatNumber(cookiesPerClick)} />
              <StatItem icon={<Zap className="h-4 w-4" />} label="Per Second" value={formatNumber(cookiesPerSecond)} />
            </div>

            {/* Rewarded Ad Button */}
            <Button
              variant="outline"
              className="w-full mt-2 bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300"
              onClick={handleWatchAd}
              disabled={adCooldown > 0}
            >
              <PlayCircle className="mr-2 h-4 w-4" />
              {adCooldown > 0 ? `Watch Ad (${formatTime(adCooldown)})` : "Watch Ad for Cookies"}
            </Button>
          </CardContent>
          <CardFooter>
            <div className="w-full">
              <div className="flex justify-between text-sm mb-1">
                <span>Progress</span>
                <span>{formatNumber(totalCookies)} total cookies</span>
              </div>
              <Progress value={(totalCookies % 1000) / 10} className="h-2" />
            </div>
          </CardFooter>
        </Card>

        {/* Banner Ad */}
        <AdBanner />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <StatItem
                icon={<Cookie className="h-4 w-4" />}
                label="Total Cookies"
                value={formatNumber(totalCookies)}
              />
              <StatItem icon={<Plus className="h-4 w-4" />} label="Per Click" value={formatNumber(cookiesPerClick)} />
              <StatItem icon={<Zap className="h-4 w-4" />} label="Per Second" value={formatNumber(cookiesPerSecond)} />
              <StatItem
                icon={<Gauge className="h-4 w-4" />}
                label="Click Power"
                value={`Level ${Math.floor(cookiesPerClick)}`}
              />
              <StatItem icon={<Cpu className="h-4 w-4" />} label="Auto Clickers" value={`${upgrades[1].level}`} />
              <StatItem icon={<CookingPot className="h-4 w-4" />} label="Bakeries" value={`${upgrades[2].level}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-6">
        <Card className="h-fit">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Upgrades</CardTitle>
            <CardDescription>Buy upgrades to increase your cookie production</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {upgrades.map((upgrade) => (
              <UpgradeItem
                key={upgrade.id}
                upgrade={upgrade}
                cookies={cookies}
                onBuy={() => buyUpgrade(upgrade.id)}
                canAfford={canAffordUpgrade(upgrade.id)}
              />
            ))}
          </CardContent>
        </Card>

        {/* Side Banner Ad */}
        <AdBanner variant="vertical" />
      </div>

      {/* Rewarded Ad Modal */}
      <RewardedAdModal isOpen={isAdModalOpen} onClose={() => setIsAdModalOpen(false)} onComplete={handleAdComplete} />
    </div>
  )
}

