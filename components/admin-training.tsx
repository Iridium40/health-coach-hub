"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  X, Plus, Edit, Trash2, ChevronDown, ChevronRight, 
  FileText, Video, ExternalLink, Loader2,
  BookOpen, Rocket, Users, Building2, GraduationCap, ArrowUp, ArrowDown
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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

// Category definitions with icons
const CATEGORIES = [
  { id: "Getting Started", label: "Getting Started", icon: Rocket, color: "bg-blue-500" },
  { id: "Client Support", label: "Client Support", icon: Users, color: "bg-green-500" },
  { id: "Business Building", label: "Business Building", icon: Building2, color: "bg-purple-500" },
  { id: "Training", label: "Training", icon: GraduationCap, color: "bg-orange-500" },
]

// Icon options for modules
const MODULE_ICONS = ["🚀", "🎯", "💬", "✨", "📱", "📊", "📈", "💡", "🎓", "📚", "🏆", "⭐", "🔥", "💪", "🌟"]

interface Module {
  id: string
  title: string
  description: string
  category: string
  sort_order: number
  for_new_coach: boolean
  icon: string
  created_at: string
}

interface Resource {
  id: string
  module_id: string
  title: string
  resource_type: "doc" | "video"
  url: string
  sort_order: number
  created_at: string
}

export function AdminTraining({ onClose }: { onClose?: () => void }) {
  const { user, profile } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  
  const [modules, setModules] = useState<Module[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(CATEGORIES.map(c => c.id)))
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  
  // Module modal state
  const [showModuleModal, setShowModuleModal] = useState(false)
  const [editingModule, setEditingModule] = useState<Module | null>(null)
  const [moduleForm, setModuleForm] = useState({
    title: "",
    description: "",
    category: "Getting Started",
    for_new_coach: true,
    icon: "🚀",
    sort_order: 0,
  })
  const [savingModule, setSavingModule] = useState(false)
  
  // Resource modal state
  const [showResourceModal, setShowResourceModal] = useState(false)
  const [editingResource, setEditingResource] = useState<Resource | null>(null)
  const [resourceModuleId, setResourceModuleId] = useState<string>("")
  const [resourceForm, setResourceForm] = useState({
    title: "",
    resource_type: "doc" as "doc" | "video",
    url: "",
    sort_order: 0,
  })
  const [savingResource, setSavingResource] = useState(false)
  
  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: "module" | "resource"; id: string; title: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  const isAdmin = profile?.user_role?.toLowerCase() === "admin"

  useEffect(() => {
    if (!user || !isAdmin) {
      setLoading(false)
      return
    }
    loadData()
  }, [user, isAdmin])

  const loadData = async () => {
    setLoading(true)
    const [modulesResult, resourcesResult] = await Promise.all([
      supabase.from("modules").select("*").order("sort_order", { ascending: true }),
      supabase.from("module_resources").select("*").order("sort_order", { ascending: true }),
    ])

    if (modulesResult.error) {
      toast({ title: "Error", description: "Failed to load modules", variant: "destructive" })
    } else {
      setModules(modulesResult.data || [])
    }

    if (resourcesResult.error) {
      toast({ title: "Error", description: "Failed to load resources", variant: "destructive" })
    } else {
      setResources(resourcesResult.data || [])
    }
    setLoading(false)
  }

  // Group modules by category
  const modulesByCategory = useMemo(() => {
    const grouped = new Map<string, Module[]>()
    CATEGORIES.forEach(cat => grouped.set(cat.id, []))
    
    modules.forEach(module => {
      const list = grouped.get(module.category) || []
      list.push(module)
      grouped.set(module.category, list)
    })
    
    return grouped
  }, [modules])

  // Get resources for a module
  const getResourcesForModule = (moduleId: string) => {
    return resources.filter(r => r.module_id === moduleId)
  }

  // Toggle category expansion
  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
  }

  // Open module modal for create/edit
  const openModuleModal = (module?: Module, category?: string) => {
    if (module) {
      setEditingModule(module)
      setModuleForm({
        title: module.title,
        description: module.description,
        category: module.category,
        for_new_coach: module.for_new_coach,
        icon: module.icon,
        sort_order: module.sort_order,
      })
    } else {
      setEditingModule(null)
      const categoryModules = modulesByCategory.get(category || "Getting Started") || []
      const maxOrder = categoryModules.length > 0 
        ? Math.max(...categoryModules.map(m => m.sort_order)) 
        : 0
      setModuleForm({
        title: "",
        description: "",
        category: category || "Getting Started",
        for_new_coach: true,
        icon: "🚀",
        sort_order: maxOrder + 1,
      })
    }
    setShowModuleModal(true)
  }

  // Save module
  const saveModule = async () => {
    if (!moduleForm.title.trim()) {
      toast({ title: "Error", description: "Title is required", variant: "destructive" })
      return
    }

    setSavingModule(true)
    
    if (editingModule) {
      // Update existing module
      const { error } = await supabase
        .from("modules")
        .update({
          title: moduleForm.title,
          description: moduleForm.description,
          category: moduleForm.category,
          for_new_coach: moduleForm.for_new_coach,
          icon: moduleForm.icon,
          sort_order: moduleForm.sort_order,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingModule.id)

      if (error) {
        toast({ title: "Error", description: "Failed to update module", variant: "destructive" })
      } else {
        toast({ title: "Success", description: "Module updated successfully" })
        setShowModuleModal(false)
        loadData()
      }
    } else {
      // Create new module
      const id = `module-${Date.now()}`
      const { error } = await supabase
        .from("modules")
        .insert({
          id,
          title: moduleForm.title,
          description: moduleForm.description,
          category: moduleForm.category,
          for_new_coach: moduleForm.for_new_coach,
          icon: moduleForm.icon,
          sort_order: moduleForm.sort_order,
        })

      if (error) {
        toast({ title: "Error", description: "Failed to create module", variant: "destructive" })
      } else {
        toast({ title: "Success", description: "Module created successfully" })
        setShowModuleModal(false)
        loadData()
      }
    }
    setSavingModule(false)
  }

  // Open resource modal for create/edit
  const openResourceModal = (moduleId: string, resource?: Resource) => {
    setResourceModuleId(moduleId)
    if (resource) {
      setEditingResource(resource)
      setResourceForm({
        title: resource.title,
        resource_type: resource.resource_type,
        url: resource.url,
        sort_order: resource.sort_order,
      })
    } else {
      setEditingResource(null)
      const moduleResources = getResourcesForModule(moduleId)
      const maxOrder = moduleResources.length > 0 
        ? Math.max(...moduleResources.map(r => r.sort_order)) 
        : 0
      setResourceForm({
        title: "",
        resource_type: "doc",
        url: "",
        sort_order: maxOrder + 1,
      })
    }
    setShowResourceModal(true)
  }

  // Save resource
  const saveResource = async () => {
    if (!resourceForm.title.trim() || !resourceForm.url.trim()) {
      toast({ title: "Error", description: "Title and URL are required", variant: "destructive" })
      return
    }

    setSavingResource(true)
    
    if (editingResource) {
      // Update existing resource
      const { error } = await supabase
        .from("module_resources")
        .update({
          title: resourceForm.title,
          resource_type: resourceForm.resource_type,
          url: resourceForm.url,
          sort_order: resourceForm.sort_order,
        })
        .eq("id", editingResource.id)

      if (error) {
        toast({ title: "Error", description: "Failed to update resource", variant: "destructive" })
      } else {
        toast({ title: "Success", description: "Resource updated successfully" })
        setShowResourceModal(false)
        loadData()
      }
    } else {
      // Create new resource
      const id = `resource-${Date.now()}`
      const { error } = await supabase
        .from("module_resources")
        .insert({
          id,
          module_id: resourceModuleId,
          title: resourceForm.title,
          resource_type: resourceForm.resource_type,
          url: resourceForm.url,
          sort_order: resourceForm.sort_order,
        })

      if (error) {
        toast({ title: "Error", description: "Failed to create resource", variant: "destructive" })
      } else {
        toast({ title: "Success", description: "Resource added successfully" })
        setShowResourceModal(false)
        loadData()
      }
    }
    setSavingResource(false)
  }

  // Delete module or resource
  const handleDelete = async () => {
    if (!deleteConfirm) return
    
    setDeleting(true)
    const table = deleteConfirm.type === "module" ? "modules" : "module_resources"
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq("id", deleteConfirm.id)

    if (error) {
      toast({ title: "Error", description: `Failed to delete ${deleteConfirm.type}`, variant: "destructive" })
    } else {
      toast({ title: "Success", description: `${deleteConfirm.type === "module" ? "Module" : "Resource"} deleted successfully` })
      loadData()
    }
    setDeleting(false)
    setDeleteConfirm(null)
  }

  // Reorder module (move up or down within category)
  const reorderModule = async (categoryId: string, moduleId: string, direction: "up" | "down") => {
    const categoryModules = modulesByCategory.get(categoryId) || []
    const currentIndex = categoryModules.findIndex(m => m.id === moduleId)
    
    if (currentIndex === -1) return
    if (direction === "up" && currentIndex === 0) return
    if (direction === "down" && currentIndex === categoryModules.length - 1) return
    
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const currentModule = categoryModules[currentIndex]
    const targetModule = categoryModules[targetIndex]
    
    // Swap sort orders
    const currentOrder = currentModule.sort_order
    const targetOrder = targetModule.sort_order
    
    // Update both modules in parallel
    const [result1, result2] = await Promise.all([
      supabase.from("modules").update({ sort_order: targetOrder }).eq("id", currentModule.id),
      supabase.from("modules").update({ sort_order: currentOrder }).eq("id", targetModule.id),
    ])
    
    if (result1.error || result2.error) {
      toast({ title: "Error", description: "Failed to reorder module", variant: "destructive" })
    } else {
      // Update local state immediately for responsive UI
      const updatedModules = [...modules]
      const idx1 = updatedModules.findIndex(m => m.id === currentModule.id)
      const idx2 = updatedModules.findIndex(m => m.id === targetModule.id)
      if (idx1 !== -1) updatedModules[idx1] = { ...updatedModules[idx1], sort_order: targetOrder }
      if (idx2 !== -1) updatedModules[idx2] = { ...updatedModules[idx2], sort_order: currentOrder }
      setModules(updatedModules.sort((a, b) => a.sort_order - b.sort_order))
    }
  }

  // Reorder resource (move up or down)
  const reorderResource = async (moduleId: string, resourceId: string, direction: "up" | "down") => {
    const moduleResources = getResourcesForModule(moduleId)
    const currentIndex = moduleResources.findIndex(r => r.id === resourceId)
    
    if (currentIndex === -1) return
    if (direction === "up" && currentIndex === 0) return
    if (direction === "down" && currentIndex === moduleResources.length - 1) return
    
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const currentResource = moduleResources[currentIndex]
    const targetResource = moduleResources[targetIndex]
    
    // Swap sort orders
    const currentOrder = currentResource.sort_order
    const targetOrder = targetResource.sort_order
    
    // Update both resources in parallel
    const [result1, result2] = await Promise.all([
      supabase.from("module_resources").update({ sort_order: targetOrder }).eq("id", currentResource.id),
      supabase.from("module_resources").update({ sort_order: currentOrder }).eq("id", targetResource.id),
    ])
    
    if (result1.error || result2.error) {
      toast({ title: "Error", description: "Failed to reorder resource", variant: "destructive" })
    } else {
      // Update local state immediately for responsive UI
      const updatedResources = [...resources]
      const idx1 = updatedResources.findIndex(r => r.id === currentResource.id)
      const idx2 = updatedResources.findIndex(r => r.id === targetResource.id)
      if (idx1 !== -1) updatedResources[idx1] = { ...updatedResources[idx1], sort_order: targetOrder }
      if (idx2 !== -1) updatedResources[idx2] = { ...updatedResources[idx2], sort_order: currentOrder }
      setResources(updatedResources.sort((a, b) => a.sort_order - b.sort_order))
    }
  }

  // Filter categories based on selection
  const displayCategories = selectedCategory === "all" 
    ? CATEGORIES 
    : CATEGORIES.filter(c => c.id === selectedCategory)

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--optavia-green))]" />
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-optavia-gray">You don't have permission to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-optavia-dark flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-[hsl(var(--optavia-green))]" />
            Manage Training Content
          </h1>
          <p className="text-optavia-gray mt-1">Create and manage training modules and resources</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Filter by Category */}
      <div className="mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[240px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tree View */}
      <div className="space-y-4">
        {displayCategories.map(category => {
          const CategoryIcon = category.icon
          const categoryModules = modulesByCategory.get(category.id) || []
          const isExpanded = expandedCategories.has(category.id)

          return (
            <Card key={category.id} className="border border-gray-200">
              <CardHeader 
                className="py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                    <div className={`w-8 h-8 rounded-lg ${category.color} flex items-center justify-center`}>
                      <CategoryIcon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{category.label}</CardTitle>
                      <p className="text-sm text-optavia-gray">{categoryModules.length} modules</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      openModuleModal(undefined, category.id)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Module
                  </Button>
                </div>
              </CardHeader>

              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4">
                  {categoryModules.length === 0 ? (
                    <p className="text-sm text-optavia-gray italic ml-8">No modules in this category</p>
                  ) : (
                    <div className="space-y-2 ml-8">
                      {categoryModules.map((module, moduleIndex) => {
                        const moduleResources = getResourcesForModule(module.id)
                        const isModuleExpanded = expandedModules.has(module.id)

                        return (
                          <div key={module.id} className="border border-gray-100 rounded-lg bg-gray-50/50 group/module">
                            {/* Module Header */}
                            <div 
                              className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-100 transition-colors rounded-t-lg"
                              onClick={() => toggleModule(module.id)}
                            >
                              <div className="flex items-center gap-3">
                                {/* Module reorder buttons */}
                                <div className="flex flex-col gap-0" onClick={e => e.stopPropagation()}>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0 opacity-0 group-hover/module:opacity-100 transition-opacity disabled:opacity-30"
                                    onClick={() => reorderModule(category.id, module.id, "up")}
                                    disabled={moduleIndex === 0}
                                  >
                                    <ArrowUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-5 w-5 p-0 opacity-0 group-hover/module:opacity-100 transition-opacity disabled:opacity-30"
                                    onClick={() => reorderModule(category.id, module.id, "down")}
                                    disabled={moduleIndex === categoryModules.length - 1}
                                  >
                                    <ArrowDown className="h-3 w-3" />
                                  </Button>
                                </div>
                                {isModuleExpanded ? (
                                  <ChevronDown className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-gray-400" />
                                )}
                                <span className="text-xl">{module.icon}</span>
                                <div>
                                  <p className="font-medium text-optavia-dark">{module.title}</p>
                                  <p className="text-xs text-optavia-gray">{moduleResources.length} resources</p>
                                </div>
                                {module.for_new_coach && (
                                  <Badge variant="secondary" className="text-xs">New Coach</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => openModuleModal(module)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => setDeleteConfirm({ type: "module", id: module.id, title: module.title })}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Resources List */}
                            {isModuleExpanded && (
                              <div className="px-3 pb-3 pt-1 border-t border-gray-100">
                                <div className="space-y-1 ml-7">
                                  {moduleResources.map((resource, index) => (
                                    <div 
                                      key={resource.id}
                                      className="flex items-center justify-between p-2 rounded hover:bg-white transition-colors group"
                                    >
                                      <div className="flex items-center gap-2">
                                        {/* Reorder buttons */}
                                        <div className="flex flex-col gap-0">
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                                            onClick={() => reorderResource(module.id, resource.id, "up")}
                                            disabled={index === 0}
                                          >
                                            <ArrowUp className="h-3 w-3" />
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                                            onClick={() => reorderResource(module.id, resource.id, "down")}
                                            disabled={index === moduleResources.length - 1}
                                          >
                                            <ArrowDown className="h-3 w-3" />
                                          </Button>
                                        </div>
                                        {resource.resource_type === "video" ? (
                                          <Video className="h-4 w-4 text-blue-500" />
                                        ) : (
                                          <FileText className="h-4 w-4 text-green-500" />
                                        )}
                                        <span className="text-sm text-optavia-dark">{resource.title}</span>
                                        <a 
                                          href={resource.url} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="text-gray-400 hover:text-[hsl(var(--optavia-green))]"
                                          onClick={e => e.stopPropagation()}
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </a>
                                      </div>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0"
                                          onClick={() => openResourceModal(module.id, resource)}
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          onClick={() => setDeleteConfirm({ type: "resource", id: resource.id, title: resource.title })}
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                  
                                  {/* Add Resource Button */}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-[hsl(var(--optavia-green))] hover:bg-green-50 mt-1"
                                    onClick={() => openResourceModal(module.id)}
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add Resource
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Module Modal */}
      <Dialog open={showModuleModal} onOpenChange={setShowModuleModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingModule ? "Edit Module" : "Create New Module"}</DialogTitle>
            <DialogDescription>
              {editingModule ? "Update the module details below." : "Add a new training module."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="module-title">Title *</Label>
              <Input
                id="module-title"
                value={moduleForm.title}
                onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                placeholder="e.g., Getting Started with Coaching"
              />
            </div>

            <div>
              <Label htmlFor="module-description">Description</Label>
              <Textarea
                id="module-description"
                value={moduleForm.description}
                onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                placeholder="Brief description of the module"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module-category">Category *</Label>
                <Select 
                  value={moduleForm.category} 
                  onValueChange={value => setModuleForm({ ...moduleForm, category: value })}
                >
                  <SelectTrigger id="module-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="module-icon">Icon</Label>
                <Select 
                  value={moduleForm.icon} 
                  onValueChange={value => setModuleForm({ ...moduleForm, icon: value })}
                >
                  <SelectTrigger id="module-icon">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODULE_ICONS.map(icon => (
                      <SelectItem key={icon} value={icon}>
                        <span className="text-xl">{icon}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="module-order">Sort Order</Label>
                <Input
                  id="module-order"
                  type="number"
                  value={moduleForm.sort_order}
                  onChange={e => setModuleForm({ ...moduleForm, sort_order: parseInt(e.target.value) || 0 })}
                />
              </div>
              
              <div className="flex items-center gap-2 pt-6">
                <Switch
                  id="module-new-coach"
                  checked={moduleForm.for_new_coach}
                  onCheckedChange={checked => setModuleForm({ ...moduleForm, for_new_coach: checked })}
                />
                <Label htmlFor="module-new-coach">For New Coaches</Label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowModuleModal(false)}>
                Cancel
              </Button>
              <Button onClick={saveModule} disabled={savingModule}>
                {savingModule && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingModule ? "Save Changes" : "Create Module"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Resource Modal */}
      <Dialog open={showResourceModal} onOpenChange={setShowResourceModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingResource ? "Edit Resource" : "Add New Resource"}</DialogTitle>
            <DialogDescription>
              {editingResource ? "Update the resource details below." : "Add a new training resource to this module."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="resource-title">Title *</Label>
              <Input
                id="resource-title"
                value={resourceForm.title}
                onChange={e => setResourceForm({ ...resourceForm, title: e.target.value })}
                placeholder="e.g., New Coach Welcome Letter"
              />
            </div>

            <div>
              <Label htmlFor="resource-type">Type *</Label>
              <Select 
                value={resourceForm.resource_type} 
                onValueChange={(value: "doc" | "video") => setResourceForm({ ...resourceForm, resource_type: value })}
              >
                <SelectTrigger id="resource-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="doc">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-green-500" />
                      Document
                    </div>
                  </SelectItem>
                  <SelectItem value="video">
                    <div className="flex items-center gap-2">
                      <Video className="h-4 w-4 text-blue-500" />
                      Video
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="resource-url">URL *</Label>
              <Input
                id="resource-url"
                value={resourceForm.url}
                onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })}
                placeholder="https://docs.google.com/document/d/..."
              />
              <p className="text-xs text-optavia-gray mt-1">
                Enter the full URL to the Google Doc, Vimeo video, or other resource
              </p>
            </div>

            <div>
              <Label htmlFor="resource-order">Sort Order</Label>
              <Input
                id="resource-order"
                type="number"
                value={resourceForm.sort_order}
                onChange={e => setResourceForm({ ...resourceForm, sort_order: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowResourceModal(false)}>
                Cancel
              </Button>
              <Button onClick={saveResource} disabled={savingResource}>
                {savingResource && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingResource ? "Save Changes" : "Add Resource"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteConfirm?.type === "module" ? "Module" : "Resource"}?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteConfirm?.title}"? 
              {deleteConfirm?.type === "module" && " This will also delete all resources within this module."}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
