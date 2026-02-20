"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Trash2, Loader2, Copy, Check, Shield, ShieldOff } from "lucide-react"

interface AccessCode {
  id: string
  code: string
  label: string | null
  is_active: boolean
  max_uses: number | null
  usage_count: number | null
  created_by: string | null
  created_at: string
  updated_at: string
  expires_at: string | null
}

export function AdminAccessCodes({ onClose }: { onClose?: () => void }) {
  const { user, profile } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newCode, setNewCode] = useState("")
  const [newLabel, setNewLabel] = useState("")
  const [newMaxUses, setNewMaxUses] = useState("")
  const [newExpiresAt, setNewExpiresAt] = useState("")
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const role = profile?.user_role?.toLowerCase()
  const isAdmin = role === "admin" || role === "system_admin"

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    loadCodes()
  }, [user, isAdmin])

  const loadCodes = async () => {
    const { data, error } = await supabase
      .from("signup_access_codes")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      toast({ title: "Error", description: "Failed to load access codes", variant: "destructive" })
    } else {
      setCodes(data || [])
    }
    setLoading(false)
  }

  const handleCreate = async () => {
    if (!newCode.trim()) {
      toast({ title: "Error", description: "Please enter a code", variant: "destructive" })
      return
    }

    setCreating(true)
    const { error } = await supabase
      .from("signup_access_codes")
      .insert({
        code: newCode.trim().toUpperCase(),
        label: newLabel.trim() || null,
        max_uses: newMaxUses ? parseInt(newMaxUses, 10) : null,
        expires_at: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
        created_by: user?.id,
      })

    if (error) {
      if (error.message?.includes("duplicate") || error.message?.includes("unique")) {
        toast({ title: "Error", description: "This code already exists", variant: "destructive" })
      } else {
        toast({ title: "Error", description: "Failed to create access code", variant: "destructive" })
      }
    } else {
      toast({ title: "Created", description: `Access code "${newCode.trim().toUpperCase()}" created` })
      setNewCode("")
      setNewLabel("")
      setNewMaxUses("")
      setNewExpiresAt("")
      loadCodes()
    }
    setCreating(false)
  }

  const handleToggleActive = async (code: AccessCode) => {
    const { error } = await supabase
      .from("signup_access_codes")
      .update({ is_active: !code.is_active })
      .eq("id", code.id)

    if (error) {
      toast({ title: "Error", description: "Failed to update code", variant: "destructive" })
    } else {
      toast({ title: "Updated", description: `Code ${code.is_active ? "deactivated" : "activated"}` })
      loadCodes()
    }
  }

  const handleDelete = async (code: AccessCode) => {
    if (!confirm(`Delete access code "${code.code}"? This cannot be undone.`)) return

    const { error } = await supabase
      .from("signup_access_codes")
      .delete()
      .eq("id", code.id)

    if (error) {
      toast({ title: "Error", description: "Failed to delete code", variant: "destructive" })
    } else {
      toast({ title: "Deleted", description: `Access code "${code.code}" deleted` })
      loadCodes()
    }
  }

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard?.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-optavia-gray">Admin access required.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-heading font-bold text-optavia-dark">Signup Access Codes</h1>
          <p className="text-sm text-optavia-gray">Manage codes that allow new users to create accounts</p>
        </div>
      </div>

      {/* Create New Code */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading text-optavia-dark flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create New Code
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="new-code" className="text-xs text-optavia-gray">Code</Label>
                <Input
                  id="new-code"
                  placeholder="e.g. COACH2026"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="bg-white border-gray-300 uppercase"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="new-label" className="text-xs text-optavia-gray">Label (optional)</Label>
                <Input
                  id="new-label"
                  placeholder="e.g. General Signup"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="sm:w-40 space-y-1">
                <Label htmlFor="new-max-uses" className="text-xs text-optavia-gray">Max Uses (optional)</Label>
                <Input
                  id="new-max-uses"
                  type="number"
                  min="1"
                  placeholder="Unlimited"
                  value={newMaxUses}
                  onChange={(e) => setNewMaxUses(e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="flex-1 space-y-1">
                <Label htmlFor="new-expires-at" className="text-xs text-optavia-gray">Expires At (optional)</Label>
                <Input
                  id="new-expires-at"
                  type="datetime-local"
                  value={newExpiresAt}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="flex items-end">
                <Button
                  onClick={handleCreate}
                  disabled={creating || !newCode.trim()}
                  className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4 mr-1" />}
                  Create
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Codes List */}
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading text-optavia-dark">
            Active Codes ({codes.filter(c => c.is_active).length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : codes.length === 0 ? (
            <p className="text-center text-optavia-gray py-8">No access codes yet. Create one above.</p>
          ) : (
            <div className="space-y-3">
              {codes.map((code) => (
                <div
                  key={code.id}
                  className={`flex items-center justify-between p-4 rounded-lg border ${
                    code.is_active
                      ? "bg-white border-gray-200"
                      : "bg-gray-50 border-gray-200 opacity-60"
                  }`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-lg font-mono font-bold text-optavia-dark">{code.code}</code>
                        <button
                          onClick={() => handleCopy(code.code, code.id)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Copy code"
                        >
                          {copiedId === code.id ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        </button>
                        {code.is_active ? (
                          <Badge className="bg-green-100 text-green-700 border-0 text-xs">Active</Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-500 border-0 text-xs">Inactive</Badge>
                        )}
                      </div>
                      {code.label && (
                        <p className="text-sm text-optavia-gray mt-0.5">{code.label}</p>
                      )}
                      <p className="text-xs text-optavia-light-gray mt-1">
                        Used {code.usage_count ?? 0}{code.max_uses ? `/${code.max_uses}` : ""} time{(code.usage_count ?? 0) !== 1 ? "s" : ""}
                        {code.max_uses && (code.usage_count ?? 0) >= code.max_uses && (
                          <span className="text-red-500 font-medium"> (limit reached)</span>
                        )}
                        {" "}&bull; Created {new Date(code.created_at).toLocaleDateString()}
                        {code.expires_at && (
                          <>
                            {" "}&bull;{" "}
                            {new Date(code.expires_at) < new Date() ? (
                              <span className="text-red-500 font-medium">Expired {new Date(code.expires_at).toLocaleDateString()}</span>
                            ) : (
                              <span>Expires {new Date(code.expires_at).toLocaleDateString()}</span>
                            )}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(code)}
                      className="text-xs"
                    >
                      {code.is_active ? (
                        <><ShieldOff className="h-3 w-3 mr-1" /> Deactivate</>
                      ) : (
                        <><Shield className="h-3 w-3 mr-1" /> Activate</>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(code)}
                      className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
