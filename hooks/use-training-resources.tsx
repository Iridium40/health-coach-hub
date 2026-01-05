"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export interface TrainingResource {
  id: string
  category: string
  title: string
  description: string | null
  url: string
  type: "document" | "video" | "canva" | "other"
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TrainingCategory {
  id: string
  name: string
  description: string | null
  icon: string
  sort_order: number
  is_active: boolean
  required_rank: string | null
}

// Coach rank hierarchy (lower index = lower rank)
export const COACH_RANKS = [
  { value: "Coach", label: "Coach" },
  { value: "SC", label: "Senior Coach (SC)" },
  { value: "MG", label: "Manager (MG)" },
  { value: "AD", label: "Associate Director (AD)" },
  { value: "DR", label: "Director (DR)" },
  { value: "ED", label: "Executive Director (ED)" },
  { value: "IED", label: "Int'l Executive Director (IED)" },
  { value: "FIBC", label: "FIBC" },
  { value: "IGD", label: "Int'l Global Director (IGD)" },
  { value: "FIBL", label: "FIBL" },
  { value: "IND", label: "Int'l National Director (IND)" },
  { value: "IPD", label: "Int'l Presidential Director (IPD)" },
]

// Check if a user's rank meets or exceeds the required rank
export function meetsRankRequirement(userRank: string | null, requiredRank: string | null): boolean {
  if (!requiredRank) return true // No requirement means everyone can access
  if (!userRank) return false // No user rank but requirement exists = no access
  
  const userIndex = COACH_RANKS.findIndex(r => r.value === userRank)
  const requiredIndex = COACH_RANKS.findIndex(r => r.value === requiredRank)
  
  if (userIndex === -1 || requiredIndex === -1) return true // Unknown ranks = allow access
  
  return userIndex >= requiredIndex
}

export interface TrainingProgress {
  total: number
  completed: number
  percentage: number
}

// Type icons
export const typeIcons: Record<string, string> = {
  document: "📄",
  video: "🎬",
  canva: "🎨",
  other: "📎",
}

export function useTrainingResources(user?: User | null, userRank?: string | null) {
  const [resources, setResources] = useState<TrainingResource[]>([])
  const [categories, setCategories] = useState<TrainingCategory[]>([])
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Load resources, categories, and completions
  const loadData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Load categories
      const { data: catData, error: catError } = await supabase
        .from("training_categories")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")

      if (catError) throw catError
      setCategories(catData || [])

      // Load resources
      const { data: resData, error: resError } = await supabase
        .from("training_resources")
        .select("*")
        .eq("is_active", true)
        .order("sort_order")

      if (resError) throw resError
      setResources(resData || [])

      // Load completions if user is logged in
      if (user) {
        const { data: compData, error: compError } = await supabase
          .from("training_resource_completions")
          .select("resource_id")
          .eq("user_id", user.id)

        if (!compError && compData) {
          setCompletedIds(new Set(compData.map(c => c.resource_id)))
        }
      }
    } catch (err: any) {
      console.error("Error loading training resources:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Filter categories based on user rank
  const accessibleCategories = useMemo(() => {
    return categories.filter(cat => meetsRankRequirement(userRank || null, cat.required_rank))
  }, [categories, userRank])

  // Get unique categories from resources (filtered by rank access)
  const uniqueCategories = useMemo(() => {
    const accessibleCategoryNames = new Set(accessibleCategories.map(c => c.name))
    const cats = Array.from(new Set(resources.map(r => r.category)))
      .filter(catName => accessibleCategoryNames.has(catName))
    // Sort by category order from training_categories table
    return cats.sort((a, b) => {
      const aOrder = categories.find(c => c.name === a)?.sort_order ?? 999
      const bOrder = categories.find(c => c.name === b)?.sort_order ?? 999
      return aOrder - bOrder
    })
  }, [resources, categories, accessibleCategories])

  // Filter resources to only include those in accessible categories
  const accessibleResources = useMemo(() => {
    const accessibleCategoryNames = new Set(accessibleCategories.map(c => c.name))
    return resources.filter(r => accessibleCategoryNames.has(r.category))
  }, [resources, accessibleCategories])

  // Get category icon
  const getCategoryIcon = useCallback((categoryName: string) => {
    return categories.find(c => c.name === categoryName)?.icon || "📚"
  }, [categories])

  // Filter resources by category and search (using accessible resources)
  const filterResources = useCallback((
    category: string | "All",
    searchQuery: string
  ): TrainingResource[] => {
    return accessibleResources.filter(r => {
      // Category filter
      if (category !== "All" && r.category !== category) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = r.title.toLowerCase().includes(query)
        const matchesDescription = r.description?.toLowerCase().includes(query) || false
        const matchesCategory = r.category.toLowerCase().includes(query)
        return matchesTitle || matchesDescription || matchesCategory
      }

      return true
    })
  }, [accessibleResources])

  // Group resources by category (using accessible resources)
  const groupedResources = useMemo(() => {
    const grouped: Record<string, TrainingResource[]> = {}
    uniqueCategories.forEach(cat => {
      grouped[cat] = accessibleResources.filter(r => r.category === cat)
    })
    return grouped
  }, [accessibleResources, uniqueCategories])

  // Calculate training progress (only for accessible resources)
  const progress: TrainingProgress = useMemo(() => {
    const total = accessibleResources.length
    const accessibleIds = new Set(accessibleResources.map(r => r.id))
    const completed = Array.from(completedIds).filter(id => accessibleIds.has(id)).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, percentage }
  }, [accessibleResources, completedIds])

  // Check if a resource is completed
  const isCompleted = useCallback((resourceId: string) => {
    return completedIds.has(resourceId)
  }, [completedIds])

  // Toggle completion status
  const toggleCompletion = useCallback(async (resourceId: string) => {
    if (!user) return

    const isCurrentlyCompleted = completedIds.has(resourceId)

    // Optimistic update
    setCompletedIds(prev => {
      const newSet = new Set(prev)
      if (isCurrentlyCompleted) {
        newSet.delete(resourceId)
      } else {
        newSet.add(resourceId)
      }
      return newSet
    })

    try {
      if (isCurrentlyCompleted) {
        // Remove completion
        const { error } = await supabase
          .from("training_resource_completions")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resourceId)

        if (error) throw error
      } else {
        // Add completion
        const { error } = await supabase
          .from("training_resource_completions")
          .insert([{ user_id: user.id, resource_id: resourceId }])

        if (error) throw error
      }
    } catch (err: any) {
      // Revert on error
      console.error("Error toggling completion:", err)
      setCompletedIds(prev => {
        const newSet = new Set(prev)
        if (isCurrentlyCompleted) {
          newSet.add(resourceId)
        } else {
          newSet.delete(resourceId)
        }
        return newSet
      })
    }
  }, [user, completedIds])

  // Get category progress (for accessible resources only)
  const getCategoryProgress = useCallback((categoryName: string) => {
    const catResources = accessibleResources.filter(r => r.category === categoryName)
    const catCompleted = catResources.filter(r => completedIds.has(r.id)).length
    return {
      total: catResources.length,
      completed: catCompleted,
      percentage: catResources.length > 0 ? Math.round((catCompleted / catResources.length) * 100) : 0
    }
  }, [accessibleResources, completedIds])

  return {
    resources,
    categories,
    uniqueCategories,
    groupedResources,
    loading,
    error,
    filterResources,
    getCategoryIcon,
    typeIcons,
    reload: loadData,
    // Completion tracking
    completedIds,
    progress,
    isCompleted,
    toggleCompletion,
    getCategoryProgress,
  }
}

// Admin hook for managing resources
export function useTrainingResourcesAdmin() {
  const { resources, categories, loading, error, reload } = useTrainingResources()
  const supabase = createClient()

  const addResource = async (resource: Omit<TrainingResource, "id" | "created_at" | "updated_at" | "is_active">) => {
    const { data, error } = await supabase
      .from("training_resources")
      .insert([{ ...resource, is_active: true }])
      .select()
      .single()

    if (error) throw error
    await reload()
    return data
  }

  const updateResource = async (id: string, updates: Partial<TrainingResource>) => {
    const { data, error } = await supabase
      .from("training_resources")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    await reload()
    return data
  }

  const deleteResource = async (id: string) => {
    // Soft delete
    const { error } = await supabase
      .from("training_resources")
      .update({ is_active: false })
      .eq("id", id)

    if (error) throw error
    await reload()
  }

  // Reorder resources within a category
  const reorderResources = async (categoryName: string, resourceIds: string[]) => {
    // Update sort_order for each resource in the new order
    const updates = resourceIds.map((id, index) => ({
      id,
      sort_order: index + 1,
    }))

    for (const update of updates) {
      const { error } = await supabase
        .from("training_resources")
        .update({ sort_order: update.sort_order })
        .eq("id", update.id)

      if (error) throw error
    }

    await reload()
  }

  // Move a single resource up or down within its category
  const moveResource = async (resourceId: string, direction: "up" | "down") => {
    // Find the resource and its siblings in the same category
    const resource = resources.find(r => r.id === resourceId)
    if (!resource) return

    const categoryResources = resources
      .filter(r => r.category === resource.category)
      .sort((a, b) => a.sort_order - b.sort_order)

    const currentIndex = categoryResources.findIndex(r => r.id === resourceId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= categoryResources.length) return

    // Create new ordered array by swapping positions
    const reordered = [...categoryResources]
    const temp = reordered[currentIndex]
    reordered[currentIndex] = reordered[newIndex]
    reordered[newIndex] = temp

    // Update all sort_orders with new sequential values
    for (let i = 0; i < reordered.length; i++) {
      await supabase
        .from("training_resources")
        .update({ sort_order: i })
        .eq("id", reordered[i].id)
    }

    await reload()
  }

  const addCategory = async (category: Omit<TrainingCategory, "id" | "is_active">) => {
    // Get max sort_order
    const maxOrder = categories.length > 0 
      ? Math.max(...categories.map(c => c.sort_order)) 
      : 0

    const { data, error } = await supabase
      .from("training_categories")
      .insert([{ ...category, is_active: true, sort_order: maxOrder + 1 }])
      .select()
      .single()

    if (error) throw error
    await reload()
    return data
  }

  const updateCategory = async (id: string, updates: Partial<TrainingCategory>) => {
    const { error } = await supabase
      .from("training_categories")
      .update(updates)
      .eq("id", id)

    if (error) throw error
    await reload()
  }

  const deleteCategory = async (id: string) => {
    // Soft delete
    const { error } = await supabase
      .from("training_categories")
      .update({ is_active: false })
      .eq("id", id)

    if (error) throw error
    await reload()
  }

  const moveCategory = async (categoryId: string, direction: "up" | "down") => {
    const sortedCategories = [...categories].sort((a, b) => a.sort_order - b.sort_order)
    const currentIndex = sortedCategories.findIndex(c => c.id === categoryId)
    if (currentIndex === -1) return

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (newIndex < 0 || newIndex >= sortedCategories.length) return

    // Create new ordered array by swapping positions
    const reordered = [...sortedCategories]
    const temp = reordered[currentIndex]
    reordered[currentIndex] = reordered[newIndex]
    reordered[newIndex] = temp

    // Update all sort_orders with new sequential values
    for (let i = 0; i < reordered.length; i++) {
      await supabase
        .from("training_categories")
        .update({ sort_order: i })
        .eq("id", reordered[i].id)
    }

    await reload()
  }

  return {
    resources,
    categories,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
    reorderResources,
    moveResource,
    addCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    reload,
  }
}
