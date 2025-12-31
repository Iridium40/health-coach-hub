"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CalendarPlus, Download, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { 
  downloadICSFile, 
  getGoogleCalendarUrl, 
  getOutlookCalendarUrl,
  getYahooCalendarUrl 
} from "@/lib/calendar-utils"
import type { ZoomCall } from "@/lib/types"

interface AddToCalendarProps {
  event: ZoomCall
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  showLabel?: boolean
}

export function AddToCalendar({ 
  event, 
  variant = "outline", 
  size = "sm",
  className = "",
  showLabel = true 
}: AddToCalendarProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const handleDownloadICS = () => {
    downloadICSFile(event)
    toast({
      title: "Calendar file downloaded",
      description: "Open the .ics file to add to your calendar",
    })
    setOpen(false)
  }

  const handleGoogleCalendar = () => {
    window.open(getGoogleCalendarUrl(event), '_blank')
    setOpen(false)
  }

  const handleOutlookCalendar = () => {
    window.open(getOutlookCalendarUrl(event), '_blank')
    setOpen(false)
  }

  const handleYahooCalendar = () => {
    window.open(getYahooCalendarUrl(event), '_blank')
    setOpen(false)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size} 
          className={`border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green))] hover:text-white ${className}`}
        >
          <CalendarPlus className="h-4 w-4" />
          {showLabel && <span className="ml-2">Add to Calendar</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-white">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="cursor-pointer">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 22h-15A2.5 2.5 0 012 19.5v-15A2.5 2.5 0 014.5 2h15A2.5 2.5 0 0122 4.5v15a2.5 2.5 0 01-2.5 2.5zM9.047 7.14v2.255H7.14V7.14h1.907zm3.813 0v2.255h-1.907V7.14h1.907zm3.813 0v2.255H14.78V7.14h1.907zM9.047 10.953v2.255H7.14v-2.255h1.907zm3.813 0v2.255h-1.907v-2.255h1.907zm3.813 0v2.255H14.78v-2.255h1.907zM9.047 14.767v2.255H7.14v-2.255h1.907zm3.813 0v2.255h-1.907v-2.255h1.907z"/>
          </svg>
          <span>Google Calendar</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleOutlookCalendar} className="cursor-pointer">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.88 12.04q0 .45-.11.87-.1.41-.33.74-.22.33-.58.52-.37.2-.87.2t-.85-.2q-.35-.21-.57-.55-.22-.33-.33-.75-.1-.42-.1-.86t.1-.87q.1-.43.34-.76.22-.34.59-.54.36-.2.87-.2t.86.2q.35.21.57.55.22.34.31.77.1.43.1.88zM24 12v9.38q0 .46-.33.8-.33.32-.8.32H7.13q-.46 0-.8-.33-.32-.33-.32-.8V18H1q-.41 0-.7-.3-.3-.29-.3-.7V7q0-.41.3-.7Q.58 6 1 6h6.5V2.55q0-.44.3-.75.3-.3.75-.3h12.9q.44 0 .75.3.3.3.3.75V5.8l.02.04V12zM8 14.5h1.5q0-.65-.24-1.14-.24-.5-.65-.82-.42-.32-.96-.47-.54-.16-1.14-.16-.67 0-1.26.19-.58.19-1.02.55-.44.36-.7.89-.25.53-.25 1.2 0 .58.19 1.06.18.48.51.85.33.37.79.58.45.22 1 .22.54 0 1.03-.17.5-.18.9-.5v-1.46H6.14v-.96H8zm13.09-9.5V3H9v3h3.5l-.01 9.34H22V5z"/>
          </svg>
          <span>Outlook / Office 365</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleYahooCalendar} className="cursor-pointer">
          <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.846 9.2L15.96 3h2.7l-4.602 9.2V18h-2.34v-5.8L7.2 3h2.76l3.086 6.2z"/>
          </svg>
          <span>Yahoo Calendar</span>
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={handleDownloadICS} className="cursor-pointer">
          <Download className="h-4 w-4 mr-2" />
          <span>Download .ics file</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
