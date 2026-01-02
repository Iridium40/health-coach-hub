"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function ClientTroubleshootingLink() {
  return (
    <div className="p-4 text-center">
      <p className="text-sm text-optavia-gray mb-4">
        Access the troubleshooting guide with solutions and scripts for common client issues.
      </p>
      <Link href="/tools/client-troubleshooting">
        <Button className="w-full bg-red-600 hover:bg-red-700 text-white">
          Open Troubleshooting Guide
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  )
}
