"use client"

import { useState, useMemo } from "react"
import { useTrainingResourcesAdmin, type TrainingResource, type TrainingCategory, COACH_RANKS } from "@/hooks/use-training-resources"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Plus,
  Edit2,
  Trash2,
  ExternalLink,
  FileText,
  Video,
  Palette,
  Link2,
  Search,
  Lightbulb,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  GripVertical,
  ArrowUp,
  ArrowDown,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface AdminTrainingResourcesProps {
  onClose?: () => void
}

export function AdminTrainingResources({ onClose }: AdminTrainingResourcesProps) {
  const {
    resources,
    categories,
    loading,
    addResource,
    updateResource,
    deleteResource,
    moveResource,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
  } = useTrainingResourcesAdmin()
  const { toast } = useToast()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [editingResource, setEditingResource] = useState<TrainingResource | null>(null)
  const [editingCategory, setEditingCategory] = useState<TrainingCategory | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<TrainingCategory | null>(null)

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    icon: "📚",
    required_rank: "" as string,
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resourceToDelete, setResourceToDelete] = useState<string | null>(null)

  const [newResource, setNewResource] = useState({
    category: "",
    title: "",
    description: "",
    url: "",
    type: "document" as "document" | "video" | "canva" | "other",
    sort_order: 0,
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-red-500" />
      case "canva":
        return <Palette className="h-4 w-4 text-purple-500" />
      case "document":
        return <FileText className="h-4 w-4 text-blue-500" />
      default:
        return <Link2 className="h-4 w-4 text-gray-500" />
    }
  }

  // Group resources by category
  const groupedResources = useMemo(() => {
    const grouped: Record<string, TrainingResource[]> = {}
    
    // Initialize all categories (even empty ones)
    categories.forEach(cat => {
      grouped[cat.name] = []
    })
    
    // Add resources to their categories
    resources.forEach(r => {
      if (!grouped[r.category]) {
        grouped[r.category] = []
      }
      grouped[r.category].push(r)
    })
    
    // Sort resources within each category by sort_order
    Object.keys(grouped).forEach(cat => {
      grouped[cat].sort((a, b) => a.sort_order - b.sort_order)
    })
    
    return grouped
  }, [resources, categories])

  // Filter by search
  const filteredGroupedResources = useMemo(() => {
    if (!searchQuery) return groupedResources
    
    const query = searchQuery.toLowerCase()
    const filtered: Record<string, TrainingResource[]> = {}
    
    Object.entries(groupedResources).forEach(([category, items]) => {
      const matchingItems = items.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
      )
      if (matchingItems.length > 0 || category.toLowerCase().includes(query)) {
        filtered[category] = matchingItems
      }
    })
    
    return filtered
  }, [groupedResources, searchQuery])

  // Get sorted categories
  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => a.sort_order - b.sort_order)
  }, [categories])

  // Toggle category expansion
  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName)
      } else {
        newSet.add(categoryName)
      }
      return newSet
    })
  }

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories(new Set(categories.map(c => c.name)))
  }

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.url || !newResource.category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    // Set sort_order to be at the end of the category
    const categoryResources = groupedResources[newResource.category] || []
    const maxOrder = categoryResources.length > 0 
      ? Math.max(...categoryResources.map(r => r.sort_order)) 
      : 0

    try {
      await addResource({
        ...newResource,
        sort_order: maxOrder + 1,
      })
      toast({ title: "Success", description: "Module added successfully" })
      setShowAddModal(false)
      setNewResource({
        category: "",
        title: "",
        description: "",
        url: "",
        type: "document",
        sort_order: 0,
      })
      // Expand the category to show the new resource
      setExpandedCategories(prev => new Set(prev).add(newResource.category))
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleUpdateResource = async () => {
    if (!editingResource) return

    try {
      await updateResource(editingResource.id, {
        category: editingResource.category,
        title: editingResource.title,
        description: editingResource.description,
        url: editingResource.url,
        type: editingResource.type,
        sort_order: editingResource.sort_order,
      })
      toast({ title: "Success", description: "Module updated successfully" })
      setShowEditModal(false)
      setEditingResource(null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleDeleteClick = (id: string) => {
    setResourceToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!resourceToDelete) return

    try {
      await deleteResource(resourceToDelete)
      toast({ title: "Success", description: "Module deleted successfully" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setDeleteDialogOpen(false)
      setResourceToDelete(null)
    }
  }

  const handleMoveResource = async (resourceId: string, direction: "up" | "down") => {
    try {
      await moveResource(resourceId, direction)
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to reorder module", variant: "destructive" })
    }
  }

  // Category handlers
  const handleAddCategory = async () => {
    if (!newCategory.name) {
      toast({ title: "Error", description: "Please enter a category name", variant: "destructive" })
      return
    }

    try {
      await addCategory({
        name: newCategory.name,
        description: newCategory.description || null,
        icon: newCategory.icon || "📚",
        sort_order: 0,
        required_rank: newCategory.required_rank || null,
      })
      toast({ title: "Success", description: "Category added successfully" })
      setShowAddCategoryModal(false)
      setNewCategory({ name: "", description: "", icon: "📚", required_rank: "" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      await updateCategory(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description,
        icon: editingCategory.icon,
        required_rank: editingCategory.required_rank,
      })
      toast({ title: "Success", description: "Category updated successfully" })
      setShowEditCategoryModal(false)
      setEditingCategory(null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleDeleteCategoryClick = (category: TrainingCategory) => {
    setCategoryToDelete(category)
    setDeleteCategoryDialogOpen(true)
  }

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return

    // Check if category has modules
    const categoryResources = resources.filter(r => r.category === categoryToDelete.name)
    if (categoryResources.length > 0) {
      toast({ 
        title: "Cannot delete", 
        description: `This category has ${categoryResources.length} modules. Remove or move them first.`,
        variant: "destructive" 
      })
      setDeleteCategoryDialogOpen(false)
      setCategoryToDelete(null)
      return
    }

    try {
      await deleteCategory(categoryToDelete.id)
      toast({ title: "Success", description: "Category deleted successfully" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    } finally {
      setDeleteCategoryDialogOpen(false)
      setCategoryToDelete(null)
    }
  }

  const handleMoveCategory = async (categoryId: string, direction: "up" | "down") => {
    try {
      await moveCategory(categoryId, direction)
    } catch (err: any) {
      toast({ title: "Error", description: "Failed to reorder category", variant: "destructive" })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))]"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-optavia-dark">Manage Training Resources</h1>
            <p className="text-optavia-gray">Organize categories and modules</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAddCategoryModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="bg-[hsl(var(--optavia-green))]">
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[hsl(var(--optavia-green))]">{resources.length}</div>
            <div className="text-sm text-gray-500">Total Modules</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">
              {resources.filter(r => r.type === "document").length}
            </div>
            <div className="text-sm text-gray-500">Documents</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-500">
              {resources.filter(r => r.type === "video").length}
            </div>
            <div className="text-sm text-gray-500">Videos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">{categories.length}</div>
            <div className="text-sm text-gray-500">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Controls */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={expandAll}>
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={collapseAll}>
                Collapse All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories with Modules */}
      <div className="space-y-4">
        {sortedCategories.map((category, index) => {
          const categoryResources = filteredGroupedResources[category.name] || []
          const isExpanded = expandedCategories.has(category.name)
          
          // Skip categories not in filtered results (unless no search)
          if (searchQuery && !filteredGroupedResources[category.name]) return null

          return (
            <Card key={category.id} className="overflow-hidden group/category">
              <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.name)}>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-4">
                  <div className="flex items-center justify-between">
                    {/* Category Reorder Controls */}
                    <div className="flex flex-col gap-0.5 mr-2 opacity-0 group-hover/category:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={index === 0}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveCategory(category.id, "up")
                        }}
                        title="Move category up"
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5"
                        disabled={index === sortedCategories.length - 1}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMoveCategory(category.id, "down")
                        }}
                        title="Move category down"
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>

                    <CollapsibleTrigger asChild>
                      <div className="flex items-center gap-3 flex-1 cursor-pointer">
                        <span className="text-2xl">{category.icon}</span>
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          {category.description && (
                            <p className="text-sm text-gray-500">{category.description}</p>
                          )}
                        </div>
                        <Badge variant="secondary" className="ml-2">
                          {categoryResources.length} modules
                        </Badge>
                        {category.required_rank && (
                          <Badge variant="outline" className="ml-2 text-purple-600 border-purple-300">
                            {category.required_rank}+ only
                          </Badge>
                        )}
                      </div>
                    </CollapsibleTrigger>

                    {/* Category Action Buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover/category:opacity-100 transition-opacity mr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingCategory(category)
                          setShowEditCategoryModal(true)
                        }}
                        title="Edit category"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteCategoryClick(category)
                        }}
                        title="Delete category"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <CollapsibleTrigger asChild>
                      <div className="cursor-pointer p-1">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </CollapsibleTrigger>
                  </div>
                </CardHeader>
                
                <CollapsibleContent>
                  <CardContent className="pt-0 pb-4">
                    {categoryResources.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No modules in this category</p>
                        <Button 
                          variant="link" 
                          onClick={() => {
                            setNewResource(prev => ({ ...prev, category: category.name }))
                            setShowAddModal(true)
                          }}
                          className="mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add first module
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {categoryResources.map((resource, index) => (
                          <div 
                            key={resource.id}
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                          >
                            {/* Order Controls */}
                            <div className="flex flex-col gap-0.5">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={index === 0}
                                onClick={() => handleMoveResource(resource.id, "up")}
                                title="Move up"
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                disabled={index === categoryResources.length - 1}
                                onClick={() => handleMoveResource(resource.id, "down")}
                                title="Move down"
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>

                            {/* Order Number */}
                            <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center text-sm font-medium text-gray-500">
                              {index + 1}
                            </div>

                            {/* Type Icon */}
                            <div className="flex-shrink-0">
                              {getTypeIcon(resource.type)}
                            </div>

                            {/* Title and Description */}
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{resource.title}</div>
                              {resource.description && (
                                <p className="text-sm text-gray-500 truncate">{resource.description}</p>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => window.open(resource.url, "_blank")}
                                title="Open URL"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingResource(resource)
                                  setShowEditModal(true)
                                }}
                                title="Edit"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteClick(resource.id)}
                                title="Delete"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          )
        })}
      </div>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Training Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category *</Label>
              <Select
                value={newResource.category}
                onValueChange={(value) => setNewResource({ ...newResource, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Title *</Label>
              <Input
                value={newResource.title}
                onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                placeholder="e.g., How to Nail the Health Assessment"
              />
            </div>
            <div>
              <Label>URL *</Label>
              <Input
                value={newResource.url}
                onChange={(e) => setNewResource({ ...newResource, url: e.target.value })}
                placeholder="https://docs.google.com/..."
              />
            </div>
            <div>
              <Label>Description (for search)</Label>
              <Textarea
                value={newResource.description}
                onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                placeholder="Add keywords and topics to help users find this resource..."
                rows={3}
              />
              <div className="flex items-start gap-2 mt-2 text-xs text-amber-600">
                <Lightbulb className="h-3 w-3 mt-0.5" />
                <span>Add keywords and topics to help users find this module when searching.</span>
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newResource.type}
                onValueChange={(value) => setNewResource({ ...newResource, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">📄 Document</SelectItem>
                  <SelectItem value="video">🎬 Video</SelectItem>
                  <SelectItem value="canva">🎨 Canva</SelectItem>
                  <SelectItem value="other">📎 Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddResource}
              disabled={!newResource.title || !newResource.url || !newResource.category}
              className="bg-[hsl(var(--optavia-green))]"
            >
              Add Module
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Training Module</DialogTitle>
          </DialogHeader>
          {editingResource && (
            <div className="space-y-4">
              <div>
                <Label>Category *</Label>
                <Select
                  value={editingResource.category}
                  onValueChange={(value) => setEditingResource({ ...editingResource, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.icon} {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Title *</Label>
                <Input
                  value={editingResource.title}
                  onChange={(e) => setEditingResource({ ...editingResource, title: e.target.value })}
                />
              </div>
              <div>
                <Label>URL *</Label>
                <Input
                  value={editingResource.url}
                  onChange={(e) => setEditingResource({ ...editingResource, url: e.target.value })}
                />
              </div>
              <div>
                <Label>Description (for search)</Label>
                <Textarea
                  value={editingResource.description || ""}
                  onChange={(e) => setEditingResource({ ...editingResource, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select
                  value={editingResource.type}
                  onValueChange={(value) => setEditingResource({ ...editingResource, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="document">📄 Document</SelectItem>
                    <SelectItem value="video">🎬 Video</SelectItem>
                    <SelectItem value="canva">🎨 Canva</SelectItem>
                    <SelectItem value="other">📎 Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateResource} className="bg-[hsl(var(--optavia-green))]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Module</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this training module? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResourceToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Category Modal */}
      <Dialog open={showAddCategoryModal} onOpenChange={setShowAddCategoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Training Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Category Name *</Label>
              <Input
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="e.g., Coach Launch Playbook"
              />
            </div>
            <div>
              <Label>Icon (Emoji)</Label>
              <Input
                value={newCategory.icon}
                onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                placeholder="📚"
                className="text-2xl"
                maxLength={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter an emoji to represent this category
              </p>
            </div>
            <div>
              <Label>Description (Optional)</Label>
              <Textarea
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Brief description of what this category covers..."
                rows={2}
              />
            </div>
            <div>
              <Label>Minimum Rank Required</Label>
              <Select
                value={newCategory.required_rank || "all"}
                onValueChange={(value) => setNewCategory({ ...newCategory, required_rank: value === "all" ? "" : value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All coaches can access" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Coaches (No Restriction)</SelectItem>
                  {COACH_RANKS.map((rank) => (
                    <SelectItem key={rank.value} value={rank.value}>
                      {rank.label} & above
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 mt-1">
                Only coaches at or above this rank can see this category
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCategoryModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddCategory}
              disabled={!newCategory.name}
              className="bg-[hsl(var(--optavia-green))]"
            >
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Modal */}
      <Dialog open={showEditCategoryModal} onOpenChange={setShowEditCategoryModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {editingCategory && (
            <div className="space-y-4">
              <div>
                <Label>Category Name *</Label>
                <Input
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Icon (Emoji)</Label>
                <Input
                  value={editingCategory.icon}
                  onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                  className="text-2xl"
                  maxLength={4}
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  value={editingCategory.description || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  rows={2}
                />
              </div>
              <div>
                <Label>Minimum Rank Required</Label>
                <Select
                  value={editingCategory.required_rank || "all"}
                  onValueChange={(value) => setEditingCategory({ ...editingCategory, required_rank: value === "all" ? null : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All coaches can access" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Coaches (No Restriction)</SelectItem>
                    {COACH_RANKS.map((rank) => (
                      <SelectItem key={rank.value} value={rank.value}>
                        {rank.label} & above
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500 mt-1">
                  Only coaches at or above this rank can see this category
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditCategoryModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateCategory} className="bg-[hsl(var(--optavia-green))]">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
      <AlertDialog open={deleteCategoryDialogOpen} onOpenChange={setDeleteCategoryDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{categoryToDelete?.name}"? 
              {categoryToDelete && resources.filter(r => r.category === categoryToDelete.name).length > 0 && (
                <span className="block mt-2 text-red-500 font-medium">
                  This category still has modules. Remove or move them first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteCategory}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
