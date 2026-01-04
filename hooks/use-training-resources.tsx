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

export function useTrainingResources(user?: User | null) {
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

  // Get unique categories from resources
  const uniqueCategories = useMemo(() => {
    const cats = Array.from(new Set(resources.map(r => r.category)))
    // Sort by category order from training_categories table
    return cats.sort((a, b) => {
      const aOrder = categories.find(c => c.name === a)?.sort_order ?? 999
      const bOrder = categories.find(c => c.name === b)?.sort_order ?? 999
      return aOrder - bOrder
    })
  }, [resources, categories])

  // Get category icon
  const getCategoryIcon = useCallback((categoryName: string) => {
    return categories.find(c => c.name === categoryName)?.icon || "📚"
  }, [categories])

  // Filter resources by category and search
  const filterResources = useCallback((
    category: string | "All",
    searchQuery: string
  ): TrainingResource[] => {
    return resources.filter(r => {
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
  }, [resources])

  // Group resources by category
  const groupedResources = useMemo(() => {
    const grouped: Record<string, TrainingResource[]> = {}
    uniqueCategories.forEach(cat => {
      grouped[cat] = resources.filter(r => r.category === cat)
    })
    return grouped
  }, [resources, uniqueCategories])

  // Calculate training progress
  const progress: TrainingProgress = useMemo(() => {
    const total = resources.length
    const completed = completedIds.size
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
    return { total, completed, percentage }
  }, [resources, completedIds])

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

  // Get category progress
  const getCategoryProgress = useCallback((categoryName: string) => {
    const catResources = resources.filter(r => r.category === categoryName)
    const catCompleted = catResources.filter(r => completedIds.has(r.id)).length
    return {
      total: catResources.length,
      completed: catCompleted,
      percentage: catResources.length > 0 ? Math.round((catCompleted / catResources.length) * 100) : 0
    }
  }, [resources, completedIds])

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

    // Swap the resources
    const swapWith = categoryResources[newIndex]
    
    // Update both sort orders
    await supabase
      .from("training_resources")
      .update({ sort_order: swapWith.sort_order })
      .eq("id", resource.id)

    await supabase
      .from("training_resources")
      .update({ sort_order: resource.sort_order })
      .eq("id", swapWith.id)

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
    const { data, error } = await supabase
      .from("training_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single()

    if (error) throw error
    await reload()
    return data
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

    const current = sortedCategories[currentIndex]
    const swapWith = sortedCategories[newIndex]

    // Swap sort orders
    await supabase
      .from("training_categories")
      .update({ sort_order: swapWith.sort_order })
      .eq("id", current.id)

    await supabase
      .from("training_categories")
      .update({ sort_order: current.sort_order })
      .eq("id", swapWith.id)

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
