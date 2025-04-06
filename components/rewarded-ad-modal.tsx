"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface RewardedAdModalProps {
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
}

export function RewardedAdModal({ isOpen, onClose, onComplete }: RewardedAdModalProps) {
  const [progress, setProgress] = useState(0)
  const [adState, setAdState] = useState<"loading" | "playing" | "complete">("loading")
  const [canSkip, setCanSkip] = useState(false)

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setProgress(0)
      setAdState("loading")
      setCanSkip(false)

      // Simulate ad loading
      const loadingTimer = setTimeout(() => {
        setAdState("playing")

        // Allow skipping after 5 seconds
        setTimeout(() => {
          setCanSkip(true)
        }, 5000)
      }, 1500)

      return () => clearTimeout(loadingTimer)
    }
  }, [isOpen])

  // Progress the ad
  useEffect(() => {
    if (isOpen && adState === "playing") {
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + 1
          if (newProgress >= 100) {
            clearInterval(interval)
            setAdState("complete")
            return 100
          }
          return newProgress
        })
      }, 100) // 10 seconds total duration

      return () => clearInterval(interval)
    }
  }, [isOpen, adState])

  // Auto-complete after reaching 100%
  useEffect(() => {
    if (progress === 100) {
      const timer = setTimeout(() => {
        onComplete()
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [progress, onComplete])

  const getAdContent = () => {
    switch (adState) {
      case "loading":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-pulse text-center">
              <div className="h-8 w-32 bg-muted rounded mb-4 mx-auto"></div>
              <div className="h-4 w-48 bg-muted rounded mb-2 mx-auto"></div>
              <div className="h-4 w-40 bg-muted rounded mx-auto"></div>
            </div>
            <div className="mt-8 text-sm text-muted-foreground">Loading advertisement...</div>
          </div>
        )

      case "playing":
        return (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-full max-w-sm aspect-video bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center mb-4">
              <div className="text-white text-center p-4">
                <h3 className="font-bold text-xl mb-2">Cookie Boost Pack</h3>
                <p>Double your cookie production with our special boost pack!</p>
              </div>
            </div>
            <div className="w-full mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Ad progress</span>
                <span>{Math.floor(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            {canSkip && (
              <Button variant="outline" size="sm" className="mt-4" onClick={onComplete}>
                Skip Ad
              </Button>
            )}
          </div>
        )

      case "complete":
        return (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="font-bold text-xl mb-2 text-amber-600">Thanks for watching!</h3>
              <p className="text-muted-foreground">Your cookie reward has been added.</p>
            </div>
            <Button className="mt-6" onClick={onComplete}>
              Claim Reward
            </Button>
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && (canSkip || adState === "complete") && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Watch Ad for Cookies</DialogTitle>
          <DialogDescription>Watch this short advertisement to earn bonus cookies!</DialogDescription>
        </DialogHeader>

        {getAdContent()}

        {(canSkip || adState === "complete") && (
          <button
            className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        )}
      </DialogContent>
    </Dialog>
  )
}

