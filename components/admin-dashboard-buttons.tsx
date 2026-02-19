"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DashboardButton {
  id: string
  sort_order: number
  label: string
  url: string
  color: string
  created_at: string
  updated_at: string
}

const COLOR_OPTIONS = [
  { value: "green", label: "Green", preview: "bg-gradient-to-br from-green-50 to-emerald-50 border-green-300" },
  { value: "blue", label: "Blue", preview: "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300" },
  { value: "purple", label: "Purple", preview: "bg-gradient-to-br from-purple-50 to-violet-50 border-purple-300" },
  { value: "orange", label: "Orange", preview: "bg-gradient-to-br from-orange-50 to-amber-50 border-orange-300" },
  { value: "brand", label: "Brand Green", preview: "bg-[hsl(var(--optavia-green-light))] border-[hsl(var(--optavia-green))]" },
]

export function AdminDashboardButtons({ onClose }: { onClose?: () => void }) {
  const { user, profile } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  const [buttons, setButtons] = useState<DashboardButton[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editedButtons, setEditedButtons] = useState<Record<string, Partial<DashboardButton>>>({})

  const role = profile?.user_role?.toLowerCase()
  const isAdmin = role === "admin" || role === "system_admin"

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    loadButtons()
  }, [user, isAdmin])

  const loadButtons = async () => {
    const { data, error } = await supabase
      .from("dashboard_buttons")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard buttons",
        variant: "destructive",
      })
    } else {
      setButtons(data || [])
    }
    setLoading(false)
  }

  const handleFieldChange = (buttonId: string, field: keyof DashboardButton, value: string) => {
    setEditedButtons(prev => ({
      ...prev,
      [buttonId]: {
        ...prev[buttonId],
        [field]: value,
      },
    }))
  }

  const getButtonValue = (button: DashboardButton, field: keyof DashboardButton): string => {
    const edited = editedButtons[button.id]
    if (edited && field in edited) {
      return edited[field] as string
    }
    return button[field] as string
  }

  const hasChanges = Object.keys(editedButtons).length > 0

  const handleSave = async () => {
    if (!hasChanges) return

    setSaving(true)
    let hasError = false

    for (const [buttonId, changes] of Object.entries(editedButtons)) {
      const { data, error } = await supabase
        .from("dashboard_buttons")
        .update({
          ...changes,
          updated_at: new Date().toISOString(),
        })
        .eq("id", buttonId)
        .select()

      if (error) {
        hasError = true
        toast({
          title: "Error",
          description: `Failed to update button: ${error.message}`,
          variant: "destructive",
        })
        break
      }

      if (!data || data.length === 0) {
        hasError = true
        toast({
          title: "Error",
          description: "Update failed — please check that your admin permissions are configured in the database.",
          variant: "destructive",
        })
        break
      }
    }

    if (!hasError) {
      toast({
        title: "Saved",
        description: "Dashboard buttons updated successfully",
      })
      setEditedButtons({})
      await loadButtons()
    }

    setSaving(false)
  }

  const getColorPreview = (colorValue: string) => {
    return COLOR_OPTIONS.find(c => c.value === colorValue)?.preview || COLOR_OPTIONS[0].preview
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-optavia-gray">Admin access required.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--optavia-green))]" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="px-2">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark">
              Dashboard Buttons
            </h1>
            <p className="text-sm text-optavia-gray mt-1">
              Manage the 4 buttons displayed on the coach dashboard.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Button List */}
      <div className="space-y-4">
        {buttons.map((button, index) => {
          const currentColor = getButtonValue(button, "color")
          const currentLabel = getButtonValue(button, "label")

          return (
            <Card key={button.id} className="bg-white border border-gray-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-3 text-optavia-dark">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-sm font-bold text-optavia-gray">
                    {index + 1}
                  </span>
                  Button {index + 1}
                  {/* Color preview swatch */}
                  <div className={`ml-auto w-16 h-8 rounded border ${getColorPreview(currentColor)}`} />
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {/* Label */}
                <div className="space-y-1.5">
                  <Label htmlFor={`label-${button.id}`} className="text-sm font-medium text-optavia-dark">
                    Button Label
                  </Label>
                  <Input
                    id={`label-${button.id}`}
                    value={getButtonValue(button, "label")}
                    onChange={(e) => handleFieldChange(button.id, "label", e.target.value)}
                    placeholder="e.g. Continue Training"
                    className="border-gray-300"
                  />
                </div>

                {/* URL */}
                <div className="space-y-1.5">
                  <Label htmlFor={`url-${button.id}`} className="text-sm font-medium text-optavia-dark">
                    URL
                  </Label>
                  <Input
                    id={`url-${button.id}`}
                    value={getButtonValue(button, "url")}
                    onChange={(e) => handleFieldChange(button.id, "url", e.target.value)}
                    placeholder="e.g. /training or https://example.com"
                    className="border-gray-300"
                  />
                  <p className="text-xs text-optavia-gray">
                    Use /path for internal pages or https://... for external links.
                  </p>
                </div>

                {/* Color */}
                <div className="space-y-1.5">
                  <Label htmlFor={`color-${button.id}`} className="text-sm font-medium text-optavia-dark">
                    Button Color
                  </Label>
                  <Select
                    value={currentColor}
                    onValueChange={(value) => handleFieldChange(button.id, "color", value)}
                  >
                    <SelectTrigger className="border-gray-300">
                      <SelectValue placeholder="Select a color" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {COLOR_OPTIONS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded border ${color.preview}`} />
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Live Preview */}
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs text-optavia-gray mb-2">Preview</p>
                  <div className={`w-full max-w-[200px] mx-auto min-h-[80px] p-3 rounded-lg border transition-all flex flex-col justify-center items-center text-center ${getColorPreview(currentColor)}`}>
                    <p className="text-sm font-medium text-optavia-dark leading-tight">{currentLabel || "Button Label"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {buttons.length === 0 && (
        <Card className="bg-white border border-gray-200 shadow-sm">
          <CardContent className="py-8 text-center">
            <p className="text-optavia-gray">No dashboard buttons found. Please run the database migration to create the default buttons.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
