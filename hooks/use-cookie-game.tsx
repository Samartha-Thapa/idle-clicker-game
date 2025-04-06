"use client"

import { useState, useEffect, type ReactNode, useCallback } from "react"
import { Cookie, CookingPot, Factory, Cpu } from "lucide-react"

export interface Upgrade {
  id: number
  name: string
  description: string
  cost: number
  baseCost: number
  value: number
  baseValue: number
  level: number
  type: "click" | "auto"
  icon: ReactNode
  iconType: string // Store icon type as a string
}

// Define upgrade templates without React components
const upgradeTemplates = [
  {
    id: 0,
    name: "Better Clicking",
    description: "Increases cookies per click",
    baseCost: 10,
    baseValue: 1,
    type: "click",
    iconType: "cookie",
  },
  {
    id: 1,
    name: "Auto Clicker",
    description: "Automatically clicks for you",
    baseCost: 50,
    baseValue: 0.5,
    type: "auto",
    iconType: "cpu",
  },
  {
    id: 2,
    name: "Bakery",
    description: "Produces cookies automatically",
    baseCost: 200,
    baseValue: 2,
    type: "auto",
    iconType: "cookingPot",
  },
  {
    id: 3,
    name: "Cookie Factory",
    description: "Mass produces cookies",
    baseCost: 1000,
    baseValue: 10,
    type: "auto",
    iconType: "factory",
  },
]

// Function to get icon component based on iconType
const getIconComponent = (iconType: string): ReactNode => {
  switch (iconType) {
    case "cookie":
      return <Cookie className="h-4 w-4" />
    case "cpu":
      return <Cpu className="h-4 w-4" />
    case "cookingPot":
      return <CookingPot className="h-4 w-4" />
    case "factory":
      return <Factory className="h-4 w-4" />
    default:
      return <Cookie className="h-4 w-4" />
  }
}

// Function to initialize upgrades with proper structure
const initializeUpgrades = (): Upgrade[] => {
  return upgradeTemplates.map((template) => ({
    ...template,
    cost: template.baseCost,
    value: template.baseValue,
    level: template.id === 0 ? 1 : 0, // Start with level 1 for Better Clicking
    icon: getIconComponent(template.iconType),
    type: template.type as "click" | "auto",
  }))
}

// Interface for serializable game data (without React components)
interface GameSaveData {
  cookies: number
  totalCookies: number
  lastSave: number
  adRevenue: number
  upgrades: Omit<Upgrade, "icon">[]
}

export function useCookieGame() {
  const [cookies, setCookies] = useState(0)
  const [totalCookies, setTotalCookies] = useState(0)
  const [cookiesPerClick, setCookiesPerClick] = useState(1)
  const [cookiesPerSecond, setCookiesPerSecond] = useState(0)
  const [lastSave, setLastSave] = useState(Date.now())
  const [adRevenue, setAdRevenue] = useState(0)
  const [upgrades, setUpgrades] = useState<Upgrade[]>(initializeUpgrades())
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null)

  // Save game to localStorage (memoized function to avoid recreating on every render)
  const saveGame = useCallback(() => {
    try {
      // Create a version of upgrades without React components for saving
      const serializableUpgrades = upgrades.map(({ icon, ...rest }) => rest)

      const saveData: GameSaveData = {
        cookies,
        totalCookies,
        upgrades: serializableUpgrades,
        lastSave: Date.now(),
        adRevenue,
      }

      localStorage.setItem("cookieGame", JSON.stringify(saveData))
      setLastSave(Date.now())
      setLastSaveTime(new Date())
    } catch (error) {
      console.error("Error saving game:", error)
    }
  }, [cookies, totalCookies, upgrades, adRevenue])

  // Load game from localStorage
  useEffect(() => {
    try {
      const savedGame = localStorage.getItem("cookieGame")
      if (savedGame) {
        const {
          cookies,
          totalCookies,
          upgrades: savedUpgrades,
          lastSave,
          adRevenue,
        } = JSON.parse(savedGame) as GameSaveData

        setCookies(cookies)
        setTotalCookies(totalCookies)
        setLastSave(lastSave)
        if (adRevenue !== undefined) setAdRevenue(adRevenue)

        // Reconstruct upgrades with React components
        if (savedUpgrades && Array.isArray(savedUpgrades)) {
          const reconstructedUpgrades = savedUpgrades.map((upgrade) => ({
            ...upgrade,
            icon: getIconComponent(upgrade.iconType),
          }))
          setUpgrades(reconstructedUpgrades)
        }

        // Calculate offline progress
        const now = Date.now()
        const offlineTime = (now - lastSave) / 1000 // in seconds

        if (offlineTime > 0) {
          const autoUpgrades = savedUpgrades.filter((upgrade) => upgrade.type === "auto")
          const offlineCps = autoUpgrades.reduce((total, upgrade) => total + upgrade.value * upgrade.level, 0)
          const offlineCookies = offlineCps * offlineTime

          if (offlineCookies > 0) {
            setCookies((prev) => prev + offlineCookies)
            setTotalCookies((prev) => prev + offlineCookies)
          }
        }
      }
    } catch (error) {
      console.error("Error loading game:", error)
      // If there's an error loading, initialize with default values
      setCookies(0)
      setTotalCookies(0)
      setUpgrades(initializeUpgrades())
    }
  }, [])

  // Save game to localStorage on interval
  useEffect(() => {
    const saveInterval = setInterval(saveGame, 5000) // Save every 5 seconds
    return () => clearInterval(saveInterval)
  }, [saveGame])

  // Save game when window is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGame()
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [saveGame])

  // Calculate cookies per click and per second
  useEffect(() => {
    const clickUpgrades = upgrades.filter((upgrade) => upgrade.type === "click")
    const autoUpgrades = upgrades.filter((upgrade) => upgrade.type === "auto")

    const newCookiesPerClick = clickUpgrades.reduce((total, upgrade) => total + upgrade.value * upgrade.level, 1)
    const newCookiesPerSecond = autoUpgrades.reduce((total, upgrade) => total + upgrade.value * upgrade.level, 0)

    setCookiesPerClick(newCookiesPerClick)
    setCookiesPerSecond(newCookiesPerSecond)
  }, [upgrades])

  // Auto-generate cookies
  useEffect(() => {
    const interval = setInterval(() => {
      if (cookiesPerSecond > 0) {
        const increment = cookiesPerSecond / 10 // 10 updates per second for smoother increments
        setCookies((prev) => prev + increment)
        setTotalCookies((prev) => prev + increment)
      }
    }, 100)

    return () => clearInterval(interval)
  }, [cookiesPerSecond])

  // Click the cookie
  const clickCookie = () => {
    const newCookies = cookies + cookiesPerClick
    const newTotalCookies = totalCookies + cookiesPerClick
    setCookies(newCookies)
    setTotalCookies(newTotalCookies)

    // Save immediately after significant actions
    if (cookiesPerClick >= 10) {
      // Only save after significant clicks to avoid too many writes
      saveGame()
    }
  }

  // Add cookies (for ad rewards)
  const addCookies = (amount: number) => {
    setCookies((prev) => prev + amount)
    setTotalCookies((prev) => prev + amount)
    setAdRevenue((prev) => prev + 1) // Track ad revenue

    // Save immediately after ad reward
    saveGame()
  }

  // Buy an upgrade
  const buyUpgrade = (id: number) => {
    let purchased = false

    setUpgrades((prev) =>
      prev.map((upgrade) => {
        if (upgrade.id === id && cookies >= upgrade.cost) {
          purchased = true
            setCookies((prev) => prev - upgrade.cost)

          // Calculate new cost using a formula: baseCost * 1.15^level
          const newLevel = upgrade.level + 1
          const newCost = Math.floor(upgrade.baseCost * Math.pow(1.15, newLevel))

          return {
            ...upgrade,
            level: newLevel,
            cost: newCost,
          }
        }
        return upgrade
      }),
    )

    // Save immediately after purchasing an upgrade
    if (purchased) {
      saveGame()
    }
  }

  // Check if player can afford an upgrade
  const canAffordUpgrade = (id: number) => {
    const upgrade = upgrades.find((u) => u.id === id)
    return upgrade ? cookies >= upgrade.cost : false
  }

  // Format large numbers
  const formatNumber = (num: number) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + "B"
    } else if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M"
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K"
    }
    return Math.floor(num).toString()
  }

  // Reset game
  const resetGame = () => {
    setCookies(0)
    setTotalCookies(0)
    setUpgrades(initializeUpgrades())
    setAdRevenue(0)
    localStorage.removeItem("cookieGame")
    localStorage.removeItem("adCooldown")
  }

  return {
    cookies,
    totalCookies,
    cookiesPerClick,
    cookiesPerSecond,
    upgrades,
    clickCookie,
    buyUpgrade,
    canAffordUpgrade,
    formatNumber,
    addCookies,
    adRevenue,
    lastSaveTime,
    resetGame,
    saveGame,
  }
}

