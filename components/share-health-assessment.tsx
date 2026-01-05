"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { createAssessmentLink } from "@/lib/assessment-links"
import { useUserData } from "@/contexts/user-data-context"
import { useToast } from "@/hooks/use-toast"
import {
  Share2,
  Copy,
  Check,
  Mail,
  MessageSquare,
  Facebook,
  Twitter,
  Linkedin,
  X,
} from "lucide-react"

interface ShareHealthAssessmentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recipientName?: string
  initialEmail?: string
  initialPhone?: string
}

export function ShareHealthAssessment({
  open,
  onOpenChange,
  recipientName,
  initialEmail = "",
  initialPhone = "",
}: ShareHealthAssessmentProps) {
  const { profile } = useUserData()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState(initialEmail)
  const [recipientPhone, setRecipientPhone] = useState(initialPhone)
  const [customMessage, setCustomMessage] = useState("")

  const assessmentLink = profile?.email ? createAssessmentLink(profile.email) : null
  const coachName = profile?.full_name || "Your Coach"
  
  const defaultMessage = `Hi${recipientName ? ` ${recipientName}` : ""}! I'd love to learn more about your health goals. Please take a few minutes to complete this quick health assessment, and I'll reach out to schedule a time to chat!\n\n${assessmentLink}\n\n- ${coachName}`

  useEffect(() => {
    if (open) {
      setCustomMessage(defaultMessage)
      setRecipientEmail(initialEmail)
      setRecipientPhone(initialPhone)
    }
  }, [open, defaultMessage, initialEmail, initialPhone])

  const handleCopyLink = async () => {
    if (!assessmentLink) return
    try {
      await navigator.clipboard.writeText(assessmentLink)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Your assessment link has been copied to clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(customMessage)
      toast({
        title: "Message copied!",
        description: "Your message has been copied to clipboard.",
      })
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please try again",
        variant: "destructive",
      })
    }
  }

  const handleShareEmail = () => {
    if (!assessmentLink) return
    const subject = encodeURIComponent("Complete Your Health Assessment")
    const body = encodeURIComponent(customMessage || defaultMessage)
    const emailUrl = recipientEmail
      ? `mailto:${recipientEmail}?subject=${subject}&body=${body}`
      : `mailto:?subject=${subject}&body=${body}`
    window.open(emailUrl)
    toast({
      title: "📧 Email Opened",
      description: "Send the health assessment invite",
    })
  }

  const handleShareSMS = () => {
    if (!assessmentLink) return
    const message = encodeURIComponent(customMessage || defaultMessage)
    const phone = recipientPhone.replace(/\D/g, "")
    const smsUrl = phone ? `sms:${phone}?body=${message}` : `sms:?body=${message}`
    window.open(smsUrl)
    toast({
      title: "📱 Messages Opened",
      description: "Send the health assessment invite",
    })
  }

  const handleShareFacebook = () => {
    if (!assessmentLink) return
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(assessmentLink)}`, "_blank", "width=600,height=400")
  }

  const handleShareTwitter = () => {
    if (!assessmentLink) return
    const text = encodeURIComponent(`Take a moment to complete this quick health assessment! 💚`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(assessmentLink)}`, "_blank", "width=600,height=400")
  }

  const handleShareLinkedIn = () => {
    if (!assessmentLink) return
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(assessmentLink)}`, "_blank", "width=600,height=400")
  }

  if (!assessmentLink) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <CardHeader>
            <CardTitle>Share Health Assessment</CardTitle>
            <CardDescription>
              Please set your email in your profile settings to generate an assessment link.
            </CardDescription>
          </CardHeader>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0">
        <Card className="border-0 shadow-none">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                  Share Health Assessment
                </CardTitle>
                <CardDescription>
                  Send your assessment link via email, SMS, or social media
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Customize Message */}
            <div className="space-y-3">
              <Label htmlFor="customMessage" className="font-semibold">
                Customize Your Message
              </Label>
              <Textarea
                id="customMessage"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                rows={5}
                className="bg-white"
                placeholder="Enter your personalized message..."
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyMessage}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Message
              </Button>
            </div>

            {/* Email Section */}
            <div className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-600" />
                <Label className="text-blue-900 font-semibold">Send via Email</Label>
              </div>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Recipient's email (optional)"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="bg-white"
                />
                <Button
                  onClick={handleShareEmail}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Open Email
                </Button>
              </div>
            </div>

            {/* SMS Section */}
            <div className="space-y-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                <Label className="text-green-900 font-semibold">Send via Text Message</Label>
              </div>
              <div className="space-y-2">
                <Input
                  type="tel"
                  placeholder="Phone number (optional)"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="bg-white"
                />
                <Button
                  onClick={handleShareSMS}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Open Messages
                </Button>
              </div>
            </div>

            {/* Social Media Section */}
            <div className="space-y-3">
              <Label className="font-semibold">Share on Social Media</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  onClick={handleShareFacebook}
                  className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600"
                >
                  <Facebook className="h-5 w-5" />
                  <span className="text-xs">Facebook</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareTwitter}
                  className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-sky-50 hover:border-sky-400 hover:text-sky-600"
                >
                  <Twitter className="h-5 w-5" />
                  <span className="text-xs">Twitter</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleShareLinkedIn}
                  className="flex flex-col items-center gap-1 h-auto py-3 hover:bg-blue-50 hover:border-blue-600 hover:text-blue-700"
                >
                  <Linkedin className="h-5 w-5" />
                  <span className="text-xs">LinkedIn</span>
                </Button>
              </div>
            </div>

            {/* Copy Link Section */}
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md border">
                <code className="flex-1 text-xs break-all">{assessmentLink}</code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  )
}
