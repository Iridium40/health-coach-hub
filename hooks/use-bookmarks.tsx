"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export interface Bookmark {
  id: string
  user_id: string
  resource_id: string
  bookmarked_at: string
}

export function useBookmarks(user: User | null) {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Load user's bookmarks
  const loadBookmarks = useCallback(async () => {
    if (!user) {
      setBookmarks(new Set())
      setLoading(false)
      return
    }

    try {
      setError(null)
      const { data, error: fetchError } = await supabase
        .from("user_bookmarks")
        .select("resource_id")
        .eq("user_id", user.id)

      if (fetchError) {
        console.error("Error loading bookmarks:", fetchError)
        setError(fetchError.message || "Failed to load bookmarks")
        return
      }

      const bookmarkSet = new Set(data?.map((b) => b.resource_id) || [])
      setBookmarks(bookmarkSet)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load bookmarks"
      console.error("Error loading bookmarks:", err)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Initial load
  useEffect(() => {
    loadBookmarks()
  }, [loadBookmarks])

  // Check if a resource is bookmarked
  const isBookmarked = useCallback((resourceId: string): boolean => {
    return bookmarks.has(resourceId)
  }, [bookmarks])

  // Toggle bookmark status
  const toggleBookmark = useCallback(async (resourceId: string): Promise<boolean> => {
    if (!user) return false

    const wasBookmarked = bookmarks.has(resourceId)

    try {
      setError(null)
      if (wasBookmarked) {
        // Remove bookmark
        const { error: deleteError } = await supabase
          .from("user_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resourceId)

        if (deleteError) {
          console.error("Error removing bookmark:", deleteError)
          setError(deleteError.message || "Failed to remove bookmark")
          return false
        }

        // Optimistic update
        setBookmarks((prev) => {
          const newSet = new Set(prev)
          newSet.delete(resourceId)
          return newSet
        })
      } else {
        // Add bookmark
        const { error: insertError } = await supabase
          .from("user_bookmarks")
          .insert({
            user_id: user.id,
            resource_id: resourceId,
          })

        if (insertError) {
          console.error("Error adding bookmark:", insertError)
          setError(insertError.message || "Failed to add bookmark")
          return false
        }

        // Optimistic update
        setBookmarks((prev) => {
          const newSet = new Set(prev)
          newSet.add(resourceId)
          return newSet
        })
      }

      return true
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to toggle bookmark"
      console.error("Error toggling bookmark:", err)
      setError(errorMsg)
      return false
    }
  }, [user, bookmarks, supabase])

  // Get all bookmarked resource IDs
  const getBookmarkedIds = useCallback((): string[] => {
    return Array.from(bookmarks)
  }, [bookmarks])

  return {
    bookmarks,
    loading,
    error,
    isBookmarked,
    toggleBookmark,
    getBookmarkedIds,
    refresh: loadBookmarks,
  }
}
