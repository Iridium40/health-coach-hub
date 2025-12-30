import type React from "react"
import type { Metadata } from "next"
import { Montserrat, Open_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-montserrat",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-open-sans",
})

export const metadata: Metadata = {
  title: "Coaching Amplifier",
  description: "Support for coaches with resources, training modules, and Lean & Green recipes",
  generator: "v0.app",
  metadataBase: new URL("http://www.coachingamplifier.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Coaching Amplifier",
    description: "Support for coaches with resources, training modules, and Lean & Green recipes",
    url: "http://www.coachingamplifier.com",
    siteName: "Coaching Amplifier",
  },
  icons: {
    icon: [
      {
        url: "/branding/favicon.ico",
      },
      {
        url: "/branding/ca_icon.png",
      },
      {
        url: "/branding/ca_icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/branding/ca_icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${montserrat.variable} ${openSans.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
