"use client"

import { useState } from "react"
import { Share2, QrCode, MessageSquare, Mail, X, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useUserData } from "@/contexts/user-data-context"

export function ShareProfile() {
  const { profile } = useUserData()
  const { toast } = useToast()
  const [qrDialogOpen, setQrDialogOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Only show if user has an optavia_id
  if (!profile?.optavia_id) {
    return null
  }

  const profileUrl = `https://www.optavia.com/us/en/coach/${profile.optavia_id}`
  
  // Generate QR code using QRServer API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(profileUrl)}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Your OPTAVIA profile link has been copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      })
    }
  }

  const handleShareText = () => {
    const message = `Check out my OPTAVIA profile: ${profileUrl}`
    const smsUrl = `sms:?body=${encodeURIComponent(message)}`
    window.location.href = smsUrl
  }

  const handleShareEmail = () => {
    const subject = "My OPTAVIA Profile"
    const body = `Check out my OPTAVIA profile:\n\n${profileUrl}`
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailtoUrl
  }

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My OPTAVIA Profile",
          text: "Check out my OPTAVIA profile",
          url: profileUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback to copy
      handleCopyLink()
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-optavia-dark hover:bg-gray-100"
            aria-label="Share profile"
          >
            <Share2 className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-white border border-gray-200 shadow-lg">
          <DropdownMenuItem onClick={() => setQrDialogOpen(true)}>
            <QrCode className="mr-2 h-4 w-4" />
            <span>QR Code</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareText}>
            <MessageSquare className="mr-2 h-4 w-4" />
            <span>Send Text</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareEmail}>
            <Mail className="mr-2 h-4 w-4" />
            <span>Send Email</span>
          </DropdownMenuItem>
          {typeof window !== "undefined" && typeof navigator.share === "function" && (
            <DropdownMenuItem onClick={handleShareNative}>
              <Share2 className="mr-2 h-4 w-4" />
              <span>Share...</span>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleCopyLink}>
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                <span>Copy Link</span>
              </>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* QR Code Dialog */}
      <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[calc(100vw-2rem)] mx-4">
          <DialogHeader>
            <DialogTitle>Share Your OPTAVIA Profile</DialogTitle>
            <DialogDescription>
              Scan this QR code to visit your OPTAVIA profile page
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4 py-4">
            <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200 w-full max-w-xs">
              <img
                src={qrCodeUrl}
                alt="QR Code for OPTAVIA Profile"
                className="w-full h-auto max-w-full"
              />
            </div>
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-md gap-2">
                <span className="text-xs sm:text-sm text-gray-600 truncate flex-1 min-w-0">
                  {profileUrl}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyLink}
                  className="flex-shrink-0"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
