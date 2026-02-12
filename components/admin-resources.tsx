"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAdminChanges } from "@/hooks/use-admin-changes"
import { AdminSaveButton } from "@/components/admin-save-button"
import { 
  X, Plus, Edit, Trash2, Search, ExternalLink, Link as LinkIcon,
  ChevronUp, ChevronDown, Eye, EyeOff, Loader2, GripVertical
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { ExternalResource } from "@/lib/types"

// Resource categories (matching the public resources page filters)
const CATEGORIES = [
  // Getting Started & Business
  "Getting Started",
  "Tax & Finance",
  "Business Development",
  // Client Journey
  "Journey Kickoff",
  "Client Text Templates",
  "Client Support",
  "Client Support Videos",
  // Nutrition & Health
  "Nutrition Guides",
  // Social & Marketing
  "Social Media Strategy",
  // Mindset & Growth
  "Troubleshooting",
  "Coaching Real Talk",
  // Legacy categories
  "OPTAVIA Portals",
  "Social Media",
  "Communities",
  "Training",
]

export function AdminResources({ onClose }: { onClose?: () => void }) {
  const { user, profile } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  const [resources, setResources] = useState<ExternalResource[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("All")
  const [filterStatus, setFilterStatus] = useState<string>("All")
  const [savingOrder, setSavingOrder] = useState(false)

  // Form state
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [url, setUrl] = useState("")
  const [buttonText, setButtonText] = useState("Visit Resource")
  const [category, setCategory] = useState("OPTAVIA Portals")
  const [features, setFeatures] = useState<string[]>([])
  const [featureInput, setFeatureInput] = useState("")
  const [isActive, setIsActive] = useState(true)
  const [isDynamic, setIsDynamic] = useState(false)
  const [showCondition, setShowCondition] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<ExternalResource | null>(null)

  // Check if user is admin (case-insensitive)
  const isAdmin = profile?.user_role?.toLowerCase() === "admin"
  
  // Ref for form section to scroll into view
  const formRef = useRef<HTMLDivElement>(null)

  // Track unsaved changes for admin
  const { 
    hasUnsavedChanges, 
    isSaving, 
    changeCount, 
    trackChange, 
    saveChanges,
    showLeaveDialog,
    confirmLeave,
    saveAndLeave,
    cancelLeave,
  } = useAdminChanges({
    storageKeys: ["pinnedResources", "resources-search-history"],
  })

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    loadResources()
  }, [user, isAdmin])

  const loadResources = async () => {
    const { data, error } = await supabase
      .from("external_resources")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load resources",
        variant: "destructive",
      })
    } else {
      setResources(data || [])
    }
    setLoading(false)
  }

  const resetForm = () => {
    setTitle("")
    setDescription("")
    setUrl("")
    setButtonText("Visit Resource")
    setCategory("OPTAVIA Resources")
    setFeatures([])
    setFeatureInput("")
    setIsActive(true)
    setIsDynamic(false)
    setShowCondition("")
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (resource: ExternalResource, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    
    setTitle(resource.title)
    setDescription(resource.description)
    setUrl(resource.url)
    setButtonText(resource.button_text)
    setCategory(resource.category)
    // Handle both legacy array format and new JSONB object format
    const featuresTags = Array.isArray(resource.features) 
      ? resource.features 
      : (resource.features?.tags && Array.isArray(resource.features.tags))
        ? resource.features.tags 
        : []
    setFeatures(featuresTags)
    setIsActive(resource.is_active)
    setIsDynamic(resource.is_dynamic)
    setShowCondition(resource.show_condition || "")
    setEditingId(resource.id)
    setShowForm(true)
    
    // Scroll to form after state updates
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 100)
  }

  const handleDeleteClick = (resource: ExternalResource, e?: React.MouseEvent) => {
    e?.stopPropagation()
    e?.preventDefault()
    setResourceToDelete(resource)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!resourceToDelete) return

    const { error } = await supabase.from("external_resources").delete().eq("id", resourceToDelete.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete resource",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Resource deleted",
      })
      trackChange()
      loadResources()
    }
    
    setDeleteDialogOpen(false)
    setResourceToDelete(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    setSubmitting(true)

    // Get the max sort_order for this category
    const categoryResources = resources.filter(r => r.category === category)
    const maxOrder = categoryResources.length > 0 
      ? Math.max(...categoryResources.map(r => r.sort_order)) 
      : 0

    const resourceData = {
      title,
      description,
      url,
      button_text: buttonText,
      category,
      // Save features as JSONB object with tags array
      features: features.length > 0 ? { tags: features } : null,
      is_active: isActive,
      is_dynamic: isDynamic,
      show_condition: showCondition || null,
      sort_order: editingId 
        ? resources.find(r => r.id === editingId)?.sort_order || maxOrder + 1
        : maxOrder + 1,
      created_by: user.id,
    }

    let error
    if (editingId) {
      const { error: updateError } = await supabase
        .from("external_resources")
        .update(resourceData)
        .eq("id", editingId)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from("external_resources").insert(resourceData)
      error = insertError
    }

    if (error) {
      console.error("Resource save error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save resource",
        variant: "destructive",
      })
      setSubmitting(false)
      return
    }
    
    toast({
      title: "Success",
      description: `Resource ${editingId ? "updated" : "created"} successfully`,
    })
    
    trackChange()
    resetForm()
    loadResources()
    setSubmitting(false)
  }

  const addFeature = () => {
    if (featureInput.trim() && !features.includes(featureInput.trim())) {
      setFeatures([...features, featureInput.trim()])
      setFeatureInput("")
    }
  }

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index))
  }

  const toggleActive = async (resource: ExternalResource) => {
    const { error } = await supabase
      .from("external_resources")
      .update({ is_active: !resource.is_active })
      .eq("id", resource.id)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update resource",
        variant: "destructive",
      })
    } else {
      trackChange()
      loadResources()
    }
  }

  const reorderResource = async (resourceId: string, direction: "up" | "down", visibleList: ExternalResource[]) => {
    setSavingOrder(true)

    const currentIndex = visibleList.findIndex(r => r.id === resourceId)

    if (currentIndex === -1) {
      setSavingOrder(false)
      return
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (newIndex < 0 || newIndex >= visibleList.length) {
      setSavingOrder(false)
      return
    }

    // Swap sort_order values between the two adjacent items in the filtered view
    const currentItem = visibleList[currentIndex]
    const swapItem = visibleList[newIndex]

    const updates = [
      { id: currentItem.id, sort_order: swapItem.sort_order },
      { id: swapItem.id, sort_order: currentItem.sort_order },
    ]

    for (const update of updates) {
      await supabase
        .from("external_resources")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id)
    }

    toast({ title: "Success", description: "Resource order updated" })
    trackChange()
    loadResources()
    setSavingOrder(false)
  }

  // Get unique categories from resources (matching the public resources page filters)
  const availableCategories = ["All", ...CATEGORIES]

  // Filter resources
  const filteredResources = resources
    .filter(resource => {
      const matchesSearch = 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.url.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = filterCategory === "All" || resource.category === filterCategory
      const matchesStatus = filterStatus === "All" || (filterStatus === "Active" ? resource.is_active : !resource.is_active)
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => a.sort_order - b.sort_order)

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-optavia-gray">You do not have permission to access this page.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))] mx-auto"></div>
        <p className="text-optavia-gray mt-4">Loading resources...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">Manage Resources</h1>
        {onClose && (
          <Button variant="ghost" onClick={onClose} className="text-optavia-gray hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Create New Resource Section */}
      <div className="mb-8" ref={formRef}>
        {!showForm ? (
          <Button
            onClick={() => setShowForm(true)}
            className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Resource
          </Button>
        ) : (
          <Card className="bg-white border border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-optavia-dark">
                {editingId ? "Edit Resource" : "Add New Resource"}
              </CardTitle>
              <CardDescription className="text-optavia-gray">
                Add an external resource link for coaches to access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-optavia-dark">Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., OPTAVIA Connect"
                      required
                      className="border-gray-300"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-optavia-dark">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-optavia-dark">Description *</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of what this resource provides..."
                    rows={3}
                    required
                    className="border-gray-300"
                  />
                </div>

                {/* URL and Button */}
                <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-optavia-dark text-sm flex items-center gap-2">
                    <LinkIcon className="h-4 w-4 text-blue-600" />
                    Link Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="url" className="text-optavia-dark">URL *</Label>
                      <Input
                        id="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://..."
                        required
                        className="border-gray-300"
                      />
                      {isDynamic && (
                        <p className="text-xs text-blue-600">
                          Use {"{optavia_id}"} as a placeholder for the user&apos;s OPTAVIA ID
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="buttonText" className="text-optavia-dark">Button Text</Label>
                      <Input
                        id="buttonText"
                        value={buttonText}
                        onChange={(e) => setButtonText(e.target.value)}
                        placeholder="Visit Resource"
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  {/* Dynamic URL Toggle */}
                  <div className="flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200">
                    <Switch
                      id="isDynamic"
                      checked={isDynamic}
                      onCheckedChange={setIsDynamic}
                    />
                    <div>
                      <Label htmlFor="isDynamic" className="cursor-pointer text-optavia-dark text-sm">
                        Dynamic URL
                      </Label>
                      <p className="text-xs text-optavia-gray">
                        URL contains placeholders that are replaced with user data
                      </p>
                    </div>
                  </div>

                  {isDynamic && (
                    <div className="space-y-2">
                      <Label htmlFor="showCondition" className="text-optavia-dark">Show Condition</Label>
                      <Select value={showCondition} onValueChange={setShowCondition}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select condition..." />
                        </SelectTrigger>
                        <SelectContent className="bg-white border border-gray-200 shadow-lg">
                          <SelectItem value="optavia_id">User has OPTAVIA ID</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-optavia-gray">
                        Only show this resource when the user meets this condition
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                  <h4 className="font-medium text-optavia-dark text-sm">Features / Highlights</h4>
                  <p className="text-xs text-optavia-gray">
                    Add bullet points that describe what users can do with this resource
                  </p>
                  
                  <div className="flex gap-2">
                    <Input
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      placeholder="Add a feature..."
                      className="border-gray-300"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addFeature()
                        }
                      }}
                    />
                    <Button type="button" onClick={addFeature} variant="outline" className="border-gray-300">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {features.map((feature, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="bg-white border border-gray-200 text-optavia-dark py-1 px-2 flex items-center gap-1"
                        >
                          {feature}
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Active Toggle */}
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-md border border-green-200">
                  <Switch
                    id="isActive"
                    checked={isActive}
                    onCheckedChange={setIsActive}
                  />
                  <div>
                    <Label htmlFor="isActive" className="cursor-pointer text-optavia-dark text-sm">
                      Active
                    </Label>
                    <p className="text-xs text-optavia-gray">
                      {isActive ? "Resource is visible to coaches" : "Resource is hidden from coaches"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))]"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>{editingId ? "Update" : "Create"} Resource</>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm} disabled={submitting}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>

      {/* List of Resources */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="font-heading font-bold text-xl text-optavia-dark">All Resources</h2>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-optavia-gray" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 border-gray-300 w-full sm:w-64"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-40 border-gray-300">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                {availableCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-32 border-gray-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border border-gray-200 shadow-lg">
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Hidden">Hidden</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredResources.length === 0 ? (
          <Card className="bg-gray-50 border border-gray-200">
            <CardContent className="py-8 text-center">
              <ExternalLink className="h-12 w-12 text-optavia-gray mx-auto mb-4" />
              <p className="text-optavia-gray">
                {searchQuery || filterCategory !== "All" || filterStatus !== "All"
                  ? "No resources match your filters" 
                  : "No resources found. Create your first resource!"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-optavia-gray mb-2">
              {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} — use arrows to reorder
            </p>
            {filteredResources.map((resource, index) => (
                        <Card 
                          key={resource.id} 
                          className={`border transition-colors ${
                            resource.is_active 
                              ? "bg-white border-gray-200 hover:border-[hsl(var(--optavia-green))]" 
                              : "bg-gray-50 border-gray-200 opacity-60"
                          }`}
                        >
                          <CardContent className="py-3 px-4">
                            <div className="flex items-start gap-3">
                              {/* Reorder controls */}
                              <div className="flex items-center gap-1 pt-1">
                                <span className="text-xs font-mono text-optavia-gray w-5 text-center">{index + 1}</span>
                                <div className="flex flex-col gap-0.5">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 p-0 border-gray-300 hover:border-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))]"
                                    onClick={() => reorderResource(resource.id, "up", filteredResources)}
                                    disabled={index === 0 || savingOrder}
                                    title="Move up"
                                  >
                                    <ChevronUp className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6 p-0 border-gray-300 hover:border-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-light))]"
                                    onClick={() => reorderResource(resource.id, "down", filteredResources)}
                                    disabled={index === filteredResources.length - 1 || savingOrder}
                                    title="Move down"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-medium text-optavia-dark truncate">
                                        {resource.title}
                                      </h4>
                                      <Badge variant="outline" className="text-xs bg-[hsl(var(--optavia-green-light))] border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green-dark))]">
                                        {resource.category}
                                      </Badge>
                                      {!resource.is_active && (
                                        <Badge variant="secondary" className="text-xs bg-gray-200">
                                          Hidden
                                        </Badge>
                                      )}
                                      {resource.is_dynamic && (
                                        <Badge variant="outline" className="text-xs border-blue-300 text-blue-600">
                                          Dynamic
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-sm text-optavia-gray line-clamp-1 mt-0.5">
                                      {resource.description}
                                    </p>
                                    <a 
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1"
                                    >
                                      {resource.url.length > 50 
                                        ? resource.url.substring(0, 50) + "..." 
                                        : resource.url}
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={() => toggleActive(resource)}
                                      className="h-8 w-8"
                                      title={resource.is_active ? "Hide resource" : "Show resource"}
                                    >
                                      {resource.is_active ? (
                                        <Eye className="h-4 w-4 text-green-600" />
                                      ) : (
                                        <EyeOff className="h-4 w-4 text-gray-400" />
                                      )}
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={(e) => handleEdit(resource, e)}
                                      className="h-8 w-8"
                                    >
                                      <Edit className="h-4 w-4 text-blue-600" />
                                    </Button>
                                    <Button
                                      size="icon"
                                      variant="ghost"
                                      onClick={(e) => handleDeleteClick(resource, e)}
                                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>

                                {/* Features/Tags */}
                                {(() => {
                                  // Handle both legacy array format and new JSONB object format
                                  const tags = Array.isArray(resource.features) 
                                    ? resource.features 
                                    : (resource.features?.tags && Array.isArray(resource.features.tags))
                                      ? resource.features.tags 
                                      : []
                                  
                                  if (tags.length === 0) return null
                                  
                                  return (
                                    <div className="flex flex-wrap gap-1 mt-2">
                                      {tags.slice(0, 3).map((tag, i) => (
                                        <Badge 
                                          key={i} 
                                          variant="secondary" 
                                          className="text-xs bg-gray-100 text-optavia-gray font-normal"
                                        >
                                          {tag}
                                        </Badge>
                                      ))}
                                      {tags.length > 3 && (
                                        <Badge 
                                          variant="secondary" 
                                          className="text-xs bg-gray-100 text-optavia-gray font-normal"
                                        >
                                          +{tags.length - 3} more
                                        </Badge>
                                      )}
                                    </div>
                                  )
                                })()}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-optavia-dark">Delete Resource</AlertDialogTitle>
            <AlertDialogDescription className="text-optavia-gray">
              Are you sure you want to delete "{resourceToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-gray-300 text-optavia-dark hover:bg-gray-100"
              onClick={() => setResourceToDelete(null)}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Save Button & Leave Dialog */}
      <AdminSaveButton
        hasUnsavedChanges={hasUnsavedChanges}
        isSaving={isSaving}
        changeCount={changeCount}
        onSave={saveChanges}
        showLeaveDialog={showLeaveDialog}
        onConfirmLeave={confirmLeave}
        onSaveAndLeave={saveAndLeave}
        onCancelLeave={cancelLeave}
      />
    </div>
  )
}
