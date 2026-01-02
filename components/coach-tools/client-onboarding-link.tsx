"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function ClientOnboardingLink() {
  return (
    <div className="p-4 text-center">
      <p className="text-sm text-optavia-gray mb-4">
        Access the comprehensive Client Onboarding Tool with templates, checklists, and quick-copy messages.
      </p>
      <Link href="/tools/client-onboarding">
        <Button className="w-full bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white">
          Open Client Onboarding Tool
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  )
}
