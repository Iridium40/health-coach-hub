"use client"

import { useState } from "react"
import { useTrainingResourcesAdmin, type TrainingResource } from "@/hooks/use-training-resources"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

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
  } = useTrainingResourcesAdmin()
  const { toast } = useToast()

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingResource, setEditingResource] = useState<TrainingResource | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterCategory, setFilterCategory] = useState<string>("All")

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

  // Filter resources
  const filteredResources = resources.filter(r => {
    if (filterCategory !== "All" && r.category !== filterCategory) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        r.title.toLowerCase().includes(query) ||
        r.description?.toLowerCase().includes(query) ||
        r.category.toLowerCase().includes(query)
      )
    }
    return true
  })

  // Get unique categories
  const uniqueCategories = Array.from(new Set(resources.map(r => r.category))).sort()

  const handleAddResource = async () => {
    if (!newResource.title || !newResource.url || !newResource.category) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }

    try {
      await addResource(newResource)
      toast({ title: "Success", description: "Resource added successfully" })
      setShowAddModal(false)
      setNewResource({
        category: "",
        title: "",
        description: "",
        url: "",
        type: "document",
        sort_order: 0,
      })
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
      toast({ title: "Success", description: "Resource updated successfully" })
      setShowEditModal(false)
      setEditingResource(null)
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
    }
  }

  const handleDeleteResource = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resource?")) return

    try {
      await deleteResource(id)
      toast({ title: "Success", description: "Resource deleted successfully" })
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" })
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
            <p className="text-optavia-gray">Add, edit, and organize training resources</p>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-[hsl(var(--optavia-green))]">
          <Plus className="h-4 w-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[hsl(var(--optavia-green))]">{resources.length}</div>
            <div className="text-sm text-gray-500">Total Resources</div>
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
            <div className="text-2xl font-bold text-purple-500">{uniqueCategories.length}</div>
            <div className="text-sm text-gray-500">Categories</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full sm:w-[250px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>{getTypeIcon(resource.type)}</TableCell>
                  <TableCell>
                    <div className="font-medium">{resource.title}</div>
                    <div className="text-xs text-gray-500 md:hidden">{resource.category}</div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{resource.category}</Badge>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell max-w-xs">
                    <p className="text-sm text-gray-500 truncate">
                      {resource.description || "No description"}
                    </p>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
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
                        onClick={() => handleDeleteResource(resource.id)}
                        title="Delete"
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filteredResources.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No resources found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Training Resource</DialogTitle>
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
                <span>Add keywords and topics to help users find this resource when searching.</span>
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
              Add Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Training Resource</DialogTitle>
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
    </div>
  )
}
