"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"

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

// Type icons
export const typeIcons: Record<string, string> = {
  document: "📄",
  video: "🎬",
  canva: "🎨",
  other: "📎",
}

export function useTrainingResources() {
  const [resources, setResources] = useState<TrainingResource[]>([])
  const [categories, setCategories] = useState<TrainingCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Load resources and categories
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
    } catch (err: any) {
      console.error("Error loading training resources:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

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

  const addCategory = async (category: Omit<TrainingCategory, "id" | "is_active">) => {
    const { data, error } = await supabase
      .from("training_categories")
      .insert([{ ...category, is_active: true }])
      .select()
      .single()

    if (error) throw error
    await reload()
    return data
  }

  return {
    resources,
    categories,
    loading,
    error,
    addResource,
    updateResource,
    deleteResource,
    addCategory,
    reload,
  }
}
