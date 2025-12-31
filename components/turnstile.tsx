"use client"

import { useEffect, useRef } from "react"

interface TurnstileProps {
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

declare global {
  interface Window {
    turnstile: {
      render: (element: HTMLElement, options: any) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onloadTurnstileCallback?: () => void
  }
}

export function Turnstile({ onVerify, onError, onExpire }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY

    if (!siteKey) {
      console.warn("Turnstile site key not configured")
      // Auto-verify in development if no key
      if (process.env.NODE_ENV === "development") {
        onVerify("development-bypass")
      }
      return
    }

    const renderWidget = () => {
      if (containerRef.current && window.turnstile && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          "error-callback": onError,
          "expired-callback": onExpire,
          theme: "light",
          size: "flexible",
        })
      }
    }

    // Check if script is already loaded
    if (window.turnstile) {
      renderWidget()
    } else {
      // Load the Turnstile script
      const script = document.createElement("script")
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onloadTurnstileCallback"
      script.async = true
      script.defer = true

      window.onloadTurnstileCallback = renderWidget

      document.head.appendChild(script)

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          window.turnstile.remove(widgetIdRef.current)
        }
        delete window.onloadTurnstileCallback
      }
    }
  }, [onVerify, onError, onExpire])

  // Don't render anything if no site key in production
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && process.env.NODE_ENV === "production") {
    return null
  }

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center my-2"
    />
  )
}

