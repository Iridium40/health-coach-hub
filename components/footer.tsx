"use client"

import Link from "next/link"
import { Facebook, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[hsl(var(--optavia-footer))] text-white py-8 sm:py-12 mt-12 sm:mt-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4 sm:gap-6">
          <div className="text-xl sm:text-2xl font-heading tracking-wider">
            <span className="font-light text-gray-300 uppercase">Coaching</span>
            <span className="font-bold text-white uppercase"> Amplifier</span>
          </div>

          <p className="text-center text-xs sm:text-sm text-gray-300 max-w-md px-4">
            Amplify your coaching business with powerful resources and tools
          </p>

          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/optavia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(var(--optavia-green))] transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a
              href="https://www.instagram.com/optavia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(var(--optavia-green))] transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a
              href="https://www.youtube.com/optavia"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[hsl(var(--optavia-green))] transition-colors"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400">
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms and Conditions
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Usage
            </Link>
          </div>

          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Coaching Amplifier. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
