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
import {
  ArrowLeft, Plus, Trash2, Loader2, GripVertical, Pencil, X, Check,
  ExternalLink, Eye, EyeOff, ChevronDown, ChevronUp,
} from "lucide-react"

interface SupportResource {
  id: string
  title: string
  description: string | null
  icon: string
  url: string
  category: string
  color: string
  is_video: boolean
  sort_order: number
  is_active: boolean
  created_at: string
}

const CATEGORY_COLORS: Record<string, string> = {
  "Getting Started": "#00A651",
  "Support Systems": "#f59e0b",
  "Growth": "#8b5cf6",
  "Education": "#ec4899",
}

const ICON_OPTIONS = ["🚀", "📅", "💬", "🚦", "🏢", "📋", "🔗", "🧠", "⚡", "📄", "🎬", "🖼", "📦", "🌐", "📊", "💡", "🔥", "🎯", "🛡", "💛"]

export function AdminClientResources({ onClose }: { onClose?: () => void }) {
  const { user, profile } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  const [resources, setResources] = useState<SupportResource[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: "",
    description: "",
    icon: "📄",
    url: "",
    category: "",
    color: "#00A651",
    is_video: false,
  })

  const role = profile?.user_role?.toLowerCase()
  const isAdmin = role === "admin" || role === "system_admin"

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    loadResources()
  }, [user, isAdmin])

  const loadResources = async () => {
    const { data, error } = await supabase
      .from("client_support_resources")
      .select("*")
      .order("sort_order", { ascending: true })

    if (error) {
      toast({ title: "Error", description: "Failed to load resources", variant: "destructive" })
    } else {
      setResources(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setForm({ title: "", description: "", icon: "📄", url: "", category: "", color: "#00A651", is_video: false })
    setEditingId(null)
    setShowForm(false)
  }

  const startEdit = (resource: SupportResource) => {
    setForm({
      title: resource.title,
      description: resource.description || "",
      icon: resource.icon,
      url: resource.url,
      category: resource.category,
      color: resource.color,
      is_video: resource.is_video,
    })
    setEditingId(resource.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.url.trim() || !form.category.trim()) {
      toast({ title: "Error", description: "Title, URL, and Category are required", variant: "destructive" })
      return
    }

    setSaving(true)

    if (editingId) {
      const { error } = await supabase
        .from("client_support_resources")
        .update({
          title: form.title.trim(),
          description: form.description.trim() || null,
          icon: form.icon,
          url: form.url.trim(),
          category: form.category.trim(),
          color: form.color,
          is_video: form.is_video,
        })
        .eq("id", editingId)

      if (error) {
        toast({ title: "Error", description: "Failed to update resource", variant: "destructive" })
      } else {
        toast({ title: "Updated", description: `"${form.title}" updated` })
        resetForm()
        loadResources()
      }
    } else {
      const maxSort = resources.length > 0 ? Math.max(...resources.map(r => r.sort_order)) : 0
      const { error } = await supabase
        .from("client_support_resources")
        .insert({
          title: form.title.trim(),
          description: form.description.trim() || null,
          icon: form.icon,
          url: form.url.trim(),
          category: form.category.trim(),
          color: form.color,
          is_video: form.is_video,
          sort_order: maxSort + 1,
          created_by: user?.id,
        })

      if (error) {
        toast({ title: "Error", description: "Failed to create resource", variant: "destructive" })
      } else {
        toast({ title: "Created", description: `"${form.title}" added` })
        resetForm()
        loadResources()
      }
    }
    setSaving(false)
  }

  const handleToggleActive = async (resource: SupportResource) => {
    const { error } = await supabase
      .from("client_support_resources")
      .update({ is_active: !resource.is_active })
      .eq("id", resource.id)

    if (error) {
      toast({ title: "Error", description: "Failed to update resource", variant: "destructive" })
    } else {
      toast({ title: "Updated", description: `"${resource.title}" ${resource.is_active ? "hidden" : "visible"}` })
      loadResources()
    }
  }

  const handleDelete = async (resource: SupportResource) => {
    if (!confirm(`Delete "${resource.title}"? This cannot be undone.`)) return

    const { error } = await supabase
      .from("client_support_resources")
      .delete()
      .eq("id", resource.id)

    if (error) {
      toast({ title: "Error", description: "Failed to delete resource", variant: "destructive" })
    } else {
      toast({ title: "Deleted", description: `"${resource.title}" removed` })
      loadResources()
    }
  }

  const handleMoveUp = async (resource: SupportResource, index: number) => {
    if (index === 0) return
    const prev = resources[index - 1]
    await Promise.all([
      supabase.from("client_support_resources").update({ sort_order: prev.sort_order }).eq("id", resource.id),
      supabase.from("client_support_resources").update({ sort_order: resource.sort_order }).eq("id", prev.id),
    ])
    loadResources()
  }

  const handleMoveDown = async (resource: SupportResource, index: number) => {
    if (index === resources.length - 1) return
    const next = resources[index + 1]
    await Promise.all([
      supabase.from("client_support_resources").update({ sort_order: next.sort_order }).eq("id", resource.id),
      supabase.from("client_support_resources").update({ sort_order: resource.sort_order }).eq("id", next.id),
    ])
    loadResources()
  }

  const categories = [...new Set(resources.map(r => r.category))]
  const existingCategories = [...new Set(resources.map(r => r.category))]

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
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-heading font-bold text-optavia-dark">Client Support Resources</h1>
            <p className="text-sm text-optavia-gray">Manage the master list of documents, videos, and guides shown on the Client Calendar</p>
          </div>
        </div>
        <Button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Resource
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading text-optavia-dark flex items-center justify-between">
              <span>{editingId ? "Edit Resource" : "Add New Resource"}</span>
              <Button variant="ghost" size="sm" onClick={resetForm}>
                <X className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-optavia-gray">Title *</Label>
                <Input
                  placeholder="e.g. Launching a Client Guide"
                  value={form.title}
                  onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                  className="bg-white border-gray-300"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-optavia-gray">Category *</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Getting Started"
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="bg-white border-gray-300 flex-1"
                    list="category-suggestions"
                  />
                  <datalist id="category-suggestions">
                    {existingCategories.map(c => (
                      <option key={c} value={c} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-optavia-gray">URL *</Label>
              <Input
                placeholder="https://..."
                value={form.url}
                onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-optavia-gray">Description</Label>
              <Input
                placeholder="Brief description of the resource"
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                className="bg-white border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-optavia-gray">Icon</Label>
                <div className="flex flex-wrap gap-1 p-2 border border-gray-200 rounded-md bg-white max-h-[80px] overflow-y-auto">
                  {ICON_OPTIONS.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setForm(prev => ({ ...prev, icon }))}
                      className={`w-8 h-8 flex items-center justify-center rounded text-lg ${form.icon === icon ? "bg-green-100 ring-2 ring-green-500" : "hover:bg-gray-100"}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-optavia-gray">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))}
                    className="bg-white border-gray-300 font-mono text-xs flex-1"
                    placeholder="#00A651"
                  />
                </div>
              </div>
              <div className="space-y-1 col-span-2 sm:col-span-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer p-2">
                  <input
                    type="checkbox"
                    checked={form.is_video}
                    onChange={(e) => setForm(prev => ({ ...prev, is_video: e.target.checked }))}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-optavia-dark font-medium">This is a video resource</span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.url.trim() || !form.category.trim()}
                className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
                {editingId ? "Update" : "Add Resource"}
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : resources.length === 0 ? (
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-optavia-gray py-8">No resources yet. Add one above.</p>
          </CardContent>
        </Card>
      ) : (
        categories.map(cat => {
          const catResources = resources.filter(r => r.category === cat)
          const isExpanded = expandedCategory === null || expandedCategory === cat
          const catColor = CATEGORY_COLORS[cat] || "#666666"
          return (
            <Card key={cat} className="bg-white border border-gray-200">
              <CardHeader
                className="pb-2 cursor-pointer"
                onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
              >
                <CardTitle className="text-sm font-heading text-optavia-dark flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: catColor }} />
                    <span className="uppercase tracking-wide">{cat}</span>
                    <Badge variant="outline" className="text-xs">{catResources.length}</Badge>
                  </div>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                </CardTitle>
              </CardHeader>
              {isExpanded && (
                <CardContent className="space-y-2">
                  {catResources.map((resource, idx) => {
                    const globalIdx = resources.indexOf(resource)
                    return (
                      <div
                        key={resource.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border ${resource.is_active ? "bg-white border-gray-200" : "bg-gray-50 border-gray-200 opacity-50"}`}
                      >
                        {/* Sort Controls */}
                        <div className="flex flex-col gap-0.5 shrink-0">
                          <button
                            onClick={() => handleMoveUp(resource, globalIdx)}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
                            disabled={globalIdx === 0}
                          >
                            <ChevronUp className="h-3 w-3" />
                          </button>
                          <GripVertical className="h-3 w-3 text-gray-300 mx-auto" />
                          <button
                            onClick={() => handleMoveDown(resource, globalIdx)}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-20"
                            disabled={globalIdx === resources.length - 1}
                          >
                            <ChevronDown className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Icon */}
                        <div className="text-xl shrink-0">{resource.icon}</div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-optavia-dark truncate">{resource.title}</span>
                            {resource.is_video && (
                              <Badge className="bg-amber-100 text-amber-700 border-0 text-[10px]">VIDEO</Badge>
                            )}
                            {!resource.is_active && (
                              <Badge className="bg-gray-100 text-gray-500 border-0 text-[10px]">HIDDEN</Badge>
                            )}
                          </div>
                          {resource.description && (
                            <p className="text-xs text-optavia-gray mt-0.5 truncate">{resource.description}</p>
                          )}
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate max-w-[300px]">{resource.url}</span>
                          </a>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => startEdit(resource)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                            title="Edit"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(resource)}
                            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700"
                            title={resource.is_active ? "Hide" : "Show"}
                          >
                            {resource.is_active ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(resource)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              )}
            </Card>
          )
        })
      )}

      {/* Summary */}
      {resources.length > 0 && (
        <div className="text-center text-xs text-optavia-gray py-2">
          {resources.filter(r => r.is_active).length} active / {resources.length} total resources across {categories.length} categories
        </div>
      )}
    </div>
  )
}
