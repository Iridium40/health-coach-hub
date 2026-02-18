"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { User } from "@supabase/supabase-js"

export type BookmarkSource = "training" | "resource" | "coach_tool"

export interface Bookmark {
  id: string
  user_id: string
  resource_id: string
  source: BookmarkSource
  bookmarked_at: string
}

export function useBookmarks(user: User | null, source: BookmarkSource = "training") {
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

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
        .eq("source", source)

      if (fetchError) {
        console.error(`Error loading ${source} bookmarks:`, fetchError)
        setError(fetchError.message || "Failed to load bookmarks")
        return
      }

      const bookmarkSet = new Set(data?.map((b) => b.resource_id) || [])
      setBookmarks(bookmarkSet)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Failed to load bookmarks"
      console.error(`Error loading ${source} bookmarks:`, err)
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [user, supabase, source])

  useEffect(() => {
    loadBookmarks()
  }, [loadBookmarks])

  const isBookmarked = useCallback((resourceId: string): boolean => {
    return bookmarks.has(resourceId)
  }, [bookmarks])

  const toggleBookmark = useCallback(async (resourceId: string): Promise<boolean> => {
    if (!user) return false

    const wasBookmarked = bookmarks.has(resourceId)

    try {
      setError(null)
      if (wasBookmarked) {
        const { error: deleteError } = await supabase
          .from("user_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resourceId)
          .eq("source", source)

        if (deleteError) {
          console.error("Error removing bookmark:", deleteError)
          setError(deleteError.message || "Failed to remove bookmark")
          return false
        }

        setBookmarks((prev) => {
          const newSet = new Set(prev)
          newSet.delete(resourceId)
          return newSet
        })
      } else {
        const { error: insertError } = await supabase
          .from("user_bookmarks")
          .insert({
            user_id: user.id,
            resource_id: resourceId,
            source,
          })

        if (insertError) {
          console.error("Error adding bookmark:", insertError)
          setError(insertError.message || "Failed to add bookmark")
          return false
        }

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
  }, [user, bookmarks, supabase, source])

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
