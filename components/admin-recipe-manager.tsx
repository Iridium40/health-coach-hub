"use client"

import { useState, useMemo, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
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
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUserData } from "@/contexts/user-data-context"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { 
  X, 
  Search, 
  Image as ImageIcon, 
  Check, 
  RefreshCw, 
  Plus, 
  Upload, 
  Trash2, 
  Edit,
  Clock,
  Users,
  ChefHat
} from "lucide-react"
import type { Recipe } from "@/lib/types"

interface AdminRecipeManagerProps {
  onClose?: () => void
}

const CATEGORIES = ["Chicken", "Seafood", "Beef", "Turkey", "Pork", "Vegetarian", "Breakfast"] as const
const DIFFICULTIES = ["Easy", "Medium", "Hard"] as const

type RecipeCategory = typeof CATEGORIES[number]
type RecipeDifficulty = typeof DIFFICULTIES[number]

interface RecipeFormData {
  id: string
  title: string
  description: string
  image: string
  category: RecipeCategory
  prepTime: number
  cookTime: number
  servings: number
  difficulty: RecipeDifficulty
  counts: {
    lean: number
    green: number
    fat: number
    condiment: number
  }
  ingredients: string[]
  instructions: string[]
}

const emptyRecipeForm: RecipeFormData = {
  id: "",
  title: "",
  description: "",
  image: "",
  category: "Chicken",
  prepTime: 10,
  cookTime: 20,
  servings: 2,
  difficulty: "Easy",
  counts: { lean: 1, green: 3, fat: 0, condiment: 0 },
  ingredients: [""],
  instructions: [""],
}

export function AdminRecipeManager({ onClose }: AdminRecipeManagerProps) {
  const { profile, recipes, refreshContent } = useUserData()
  const { toast } = useToast()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("All")
  const [editingRecipe, setEditingRecipe] = useState<RecipeFormData | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Recipe | null>(null)
  const [activeTab, setActiveTab] = useState<"list" | "create">("list")

  const isAdmin = profile?.user_role?.toLowerCase() === "admin"

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(recipes.map(r => r.category)))
    return ["All", ...cats.sort()]
  }, [recipes])

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    return recipes.filter(recipe => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        recipe.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === "All" || recipe.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [recipes, searchQuery, categoryFilter])

  const handleEditRecipe = (recipe: Recipe) => {
    setEditingRecipe({
      id: recipe.id,
      title: recipe.title,
      description: recipe.description,
      image: recipe.image || "",
      category: recipe.category as RecipeCategory,
      prepTime: recipe.prepTime,
      cookTime: recipe.cookTime,
      servings: recipe.servings,
      difficulty: recipe.difficulty as RecipeDifficulty,
      counts: { ...recipe.counts },
      ingredients: [...recipe.ingredients],
      instructions: [...recipe.instructions],
    })
    setIsCreating(false)
  }

  const handleCreateNew = () => {
    const newId = `recipe-${Date.now()}`
    setEditingRecipe({ ...emptyRecipeForm, id: newId })
    setIsCreating(true)
  }

  // Resize image to 400x300 before upload
  const resizeImage = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'))
        return
      }

      img.onload = () => {
        // Set target dimensions
        const targetWidth = 400
        const targetHeight = 300
        
        canvas.width = targetWidth
        canvas.height = targetHeight
        
        // Calculate scaling to cover the target area (crop to fit)
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        
        // Center the image (crop excess)
        const offsetX = (targetWidth - scaledWidth) / 2
        const offsetY = (targetHeight - scaledHeight) / 2
        
        // Fill with white background (in case of transparency)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, targetWidth, targetHeight)
        
        // Draw resized image
        ctx.drawImage(img, offsetX, offsetY, scaledWidth, scaledHeight)
        
        // Convert to blob
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob)
          } else {
            reject(new Error('Failed to create blob'))
          }
        }, 'image/jpeg', 0.85) // Use JPEG with 85% quality for smaller file size
      }

      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = URL.createObjectURL(file)
    })
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editingRecipe) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (JPG, PNG, WebP)",
        variant: "destructive",
      })
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)

    try {
      // Resize image to 400x300
      const resizedBlob = await resizeImage(file)
      const fileName = `${editingRecipe.id}-${Date.now()}.jpg` // Always save as jpg after resize

      // Upload to recipes bucket
      const { error: uploadError } = await supabase.storage
        .from("recipes")
        .upload(fileName, resizedBlob, {
          cacheControl: "3600",
          upsert: true,
          contentType: 'image/jpeg',
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from("recipes")
        .getPublicUrl(fileName)

      // Update form with new image URL
      setEditingRecipe(prev => prev ? { ...prev, image: publicUrl } : null)

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      })
    } catch (error: any) {
      console.error("Error uploading image:", error)
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleSaveRecipe = async () => {
    if (!editingRecipe) return

    // Validate required fields
    if (!editingRecipe.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please enter a recipe title",
        variant: "destructive",
      })
      return
    }

    if (!editingRecipe.description.trim()) {
      toast({
        title: "Missing description",
        description: "Please enter a recipe description",
        variant: "destructive",
      })
      return
    }

    const validIngredients = editingRecipe.ingredients.filter(i => i.trim())
    const validInstructions = editingRecipe.instructions.filter(i => i.trim())

    if (validIngredients.length === 0) {
      toast({
        title: "Missing ingredients",
        description: "Please add at least one ingredient",
        variant: "destructive",
      })
      return
    }

    if (validInstructions.length === 0) {
      toast({
        title: "Missing instructions",
        description: "Please add at least one instruction",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const recipeData = {
        id: editingRecipe.id,
        title: editingRecipe.title.trim(),
        description: editingRecipe.description.trim(),
        image: editingRecipe.image || null,
        category: editingRecipe.category,
        prep_time: editingRecipe.prepTime,
        cook_time: editingRecipe.cookTime,
        servings: editingRecipe.servings,
        difficulty: editingRecipe.difficulty,
        lean_count: editingRecipe.counts.lean,
        green_count: editingRecipe.counts.green,
        fat_count: editingRecipe.counts.fat,
        condiment_count: editingRecipe.counts.condiment,
        ingredients: validIngredients,
        instructions: validInstructions,
        updated_at: new Date().toISOString(),
      }

      if (isCreating) {
        // Insert new recipe
        const { error } = await supabase
          .from("recipes")
          .insert({
            ...recipeData,
            created_at: new Date().toISOString(),
          })

        if (error) throw error

        toast({
          title: "Recipe created",
          description: `"${editingRecipe.title}" has been added`,
        })
      } else {
        // Update existing recipe
        const { error } = await supabase
          .from("recipes")
          .update(recipeData)
          .eq("id", editingRecipe.id)

        if (error) throw error

        toast({
          title: "Recipe updated",
          description: `"${editingRecipe.title}" has been saved`,
        })
      }

      await refreshContent()
      setEditingRecipe(null)
      setIsCreating(false)
    } catch (error: any) {
      console.error("Error saving recipe:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save recipe",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteRecipe = async () => {
    if (!deleteConfirm) return

    try {
      const { error } = await supabase
        .from("recipes")
        .delete()
        .eq("id", deleteConfirm.id)

      if (error) throw error

      toast({
        title: "Recipe deleted",
        description: `"${deleteConfirm.title}" has been removed`,
      })

      await refreshContent()
      setDeleteConfirm(null)
    } catch (error: any) {
      console.error("Error deleting recipe:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete recipe",
        variant: "destructive",
      })
    }
  }

  const addIngredient = () => {
    if (editingRecipe) {
      setEditingRecipe({
        ...editingRecipe,
        ingredients: [...editingRecipe.ingredients, ""],
      })
    }
  }

  const updateIngredient = (index: number, value: string) => {
    if (editingRecipe) {
      const newIngredients = [...editingRecipe.ingredients]
      newIngredients[index] = value
      setEditingRecipe({ ...editingRecipe, ingredients: newIngredients })
    }
  }

  const removeIngredient = (index: number) => {
    if (editingRecipe && editingRecipe.ingredients.length > 1) {
      setEditingRecipe({
        ...editingRecipe,
        ingredients: editingRecipe.ingredients.filter((_, i) => i !== index),
      })
    }
  }

  const addInstruction = () => {
    if (editingRecipe) {
      setEditingRecipe({
        ...editingRecipe,
        instructions: [...editingRecipe.instructions, ""],
      })
    }
  }

  const updateInstruction = (index: number, value: string) => {
    if (editingRecipe) {
      const newInstructions = [...editingRecipe.instructions]
      newInstructions[index] = value
      setEditingRecipe({ ...editingRecipe, instructions: newInstructions })
    }
  }

  const removeInstruction = (index: number) => {
    if (editingRecipe && editingRecipe.instructions.length > 1) {
      setEditingRecipe({
        ...editingRecipe,
        instructions: editingRecipe.instructions.filter((_, i) => i !== index),
      })
    }
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-white border border-gray-200">
          <CardContent className="pt-6">
            <p className="text-center text-optavia-gray">
              You don&apos;t have permission to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark">
            Recipe Manager
          </h1>
          <p className="text-optavia-gray mt-1">
            Create, edit, and manage recipes with image uploads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleCreateNew}
            className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Recipe</span>
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search recipes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white">
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <Card className="bg-white">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-[hsl(var(--optavia-green))]">{recipes.length}</div>
            <div className="text-xs text-optavia-gray">Total Recipes</div>
          </CardContent>
        </Card>
        {CATEGORIES.slice(0, 3).map(cat => (
          <Card key={cat} className="bg-white">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-optavia-dark">
                {recipes.filter(r => r.category === cat).length}
              </div>
              <div className="text-xs text-optavia-gray">{cat}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recipe Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRecipes.map(recipe => (
          <Card 
            key={recipe.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow group"
          >
            <div className="relative aspect-video bg-gray-100">
              {recipe.image ? (
                <img
                  src={recipe.image}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="h-12 w-12" />
                </div>
              )}
              <Badge className="absolute top-2 right-2 bg-white/90 text-optavia-dark text-xs">
                {recipe.category}
              </Badge>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold text-optavia-dark line-clamp-1 mb-1">
                {recipe.title}
              </h3>
              <p className="text-xs text-optavia-gray line-clamp-2 mb-3">
                {recipe.description}
              </p>
              <div className="flex items-center gap-3 text-xs text-optavia-gray mb-3">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {recipe.prepTime + recipe.cookTime}m
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {recipe.servings}
                </span>
                <span className="flex items-center gap-1">
                  <ChefHat className="h-3 w-3" />
                  {recipe.difficulty}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1 gap-1"
                  onClick={() => handleEditRecipe(recipe)}
                >
                  <Edit className="h-3 w-3" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => setDeleteConfirm(recipe)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12 text-optavia-gray">
          No recipes found matching your search.
        </div>
      )}

      {/* Edit/Create Recipe Dialog */}
      <Dialog open={!!editingRecipe} onOpenChange={() => { setEditingRecipe(null); setIsCreating(false) }}>
        <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-optavia-dark">
              {isCreating ? "Create New Recipe" : `Edit: ${editingRecipe?.title}`}
            </DialogTitle>
            <DialogDescription className="text-optavia-gray">
              {isCreating ? "Add a new recipe to the collection" : "Update recipe details and image"}
            </DialogDescription>
          </DialogHeader>

          {editingRecipe && (
            <Tabs defaultValue="details" className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-4 mt-4">
                {/* Image Upload */}
                <div className="space-y-2">
                  <Label>Recipe Image</Label>
                  <div className="flex gap-4">
                    <div className="w-40 h-28 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {editingRecipe.image ? (
                        <img
                          src={editingRecipe.image}
                          alt="Recipe"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full gap-2"
                      >
                        {uploading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4" />
                            Upload Image
                          </>
                        )}
                      </Button>
                      <p className="text-xs text-optavia-gray">
                        Auto-resized to 400×300 • JPG, PNG, or WebP
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          placeholder="Or paste image URL..."
                          value={editingRecipe.image}
                          onChange={(e) => setEditingRecipe({ ...editingRecipe, image: e.target.value })}
                          className="text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={editingRecipe.title}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, title: e.target.value })}
                      placeholder="Recipe title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={editingRecipe.category}
                      onValueChange={(value) => setEditingRecipe({ ...editingRecipe, category: value as RecipeCategory })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={editingRecipe.description}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, description: e.target.value })}
                    placeholder="Brief description of the recipe"
                    rows={2}
                  />
                </div>

                {/* Time, Servings, Difficulty */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Prep Time (min)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editingRecipe.prepTime}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, prepTime: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cook Time (min)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={editingRecipe.cookTime}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, cookTime: parseInt(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Servings</Label>
                    <Input
                      type="number"
                      min="1"
                      value={editingRecipe.servings}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, servings: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Difficulty</Label>
                    <Select
                      value={editingRecipe.difficulty}
                      onValueChange={(value) => setEditingRecipe({ ...editingRecipe, difficulty: value as RecipeDifficulty })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {DIFFICULTIES.map(diff => (
                          <SelectItem key={diff} value={diff}>{diff}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* OPTAVIA Counts */}
                <div className="space-y-2">
                  <Label>OPTAVIA Counts</Label>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-optavia-gray">Lean</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editingRecipe.counts.lean}
                        onChange={(e) => setEditingRecipe({
                          ...editingRecipe,
                          counts: { ...editingRecipe.counts, lean: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-optavia-gray">Green</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editingRecipe.counts.green}
                        onChange={(e) => setEditingRecipe({
                          ...editingRecipe,
                          counts: { ...editingRecipe.counts, green: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-optavia-gray">Fat</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editingRecipe.counts.fat}
                        onChange={(e) => setEditingRecipe({
                          ...editingRecipe,
                          counts: { ...editingRecipe.counts, fat: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-optavia-gray">Condiment</Label>
                      <Input
                        type="number"
                        min="0"
                        value={editingRecipe.counts.condiment}
                        onChange={(e) => setEditingRecipe({
                          ...editingRecipe,
                          counts: { ...editingRecipe.counts, condiment: parseInt(e.target.value) || 0 }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Ingredients Tab */}
              <TabsContent value="ingredients" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label>Ingredients *</Label>
                  <Button variant="outline" size="sm" onClick={addIngredient} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add
                  </Button>
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {editingRecipe.ingredients.map((ingredient, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={ingredient}
                        onChange={(e) => updateIngredient(index, e.target.value)}
                        placeholder={`Ingredient ${index + 1}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeIngredient(index)}
                        disabled={editingRecipe.ingredients.length === 1}
                        className="text-red-500 hover:text-red-600 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Instructions Tab */}
              <TabsContent value="instructions" className="space-y-4 mt-4">
                <div className="flex items-center justify-between">
                  <Label>Instructions *</Label>
                  <Button variant="outline" size="sm" onClick={addInstruction} className="gap-1">
                    <Plus className="h-3 w-3" />
                    Add Step
                  </Button>
                </div>
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  {editingRecipe.instructions.map((instruction, index) => (
                    <div key={index} className="flex gap-2">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[hsl(var(--optavia-green))] text-white flex items-center justify-center text-xs font-bold mt-2">
                        {index + 1}
                      </div>
                      <Textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        placeholder={`Step ${index + 1}`}
                        rows={2}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeInstruction(index)}
                        disabled={editingRecipe.instructions.length === 1}
                        className="text-red-500 hover:text-red-600 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          )}

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => { setEditingRecipe(null); setIsCreating(false) }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveRecipe}
              disabled={saving}
              className="bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] gap-2"
            >
              {saving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4" />
                  {isCreating ? "Create Recipe" : "Save Changes"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent className="bg-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">Delete Recipe</DialogTitle>
            <DialogDescription className="text-optavia-gray">
              Are you sure you want to delete &quot;{deleteConfirm?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRecipe}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
