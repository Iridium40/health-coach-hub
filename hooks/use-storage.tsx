"use client"

import { useState, useEffect } from "react"
import type { UserData } from "@/lib/types"

const STORAGE_KEY = "coaching-amplifier-user"

export function useStorage(): [UserData | null, (data: UserData | null) => void] {
  const [userData, setUserDataState] = useState<UserData | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setUserDataState(JSON.parse(stored))
        } catch (e) {
          console.error("Failed to parse stored user data:", e)
        }
      }
      setIsInitialized(true)
    }
  }, [])

  const setUserData = (data: UserData | null) => {
    setUserDataState(data)
    if (typeof window !== "undefined") {
      if (data === null) {
        localStorage.removeItem(STORAGE_KEY)
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    }
  }

  return [isInitialized ? userData : null, setUserData]
}
