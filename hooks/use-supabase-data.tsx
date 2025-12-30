"use client"

import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { getEarnedBadges } from "@/lib/badges"

export interface UserProfile {
  id: string
  email: string | null
  full_name: string | null
  avatar_url: string | null
  is_new_coach: boolean
  user_role: string | null
  coach_rank: string | null
  created_at: string
  updated_at: string
}

export interface NotificationSettings {
  id: string
  user_id: string
  push_enabled: boolean
  announcements_enabled: boolean
  progress_updates_enabled: boolean
  email_notifications: boolean
  push_token: string | null
  created_at: string
  updated_at: string
}

export interface AchievementBadge {
  id: string
  user_id: string
  badge_type: string
  category: string | null
  earned_at: string
}

export function useSupabaseData(user: User | null) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [completedResources, setCompletedResources] = useState<string[]>([])
  const [bookmarks, setBookmarks] = useState<string[]>([])
  const [favoriteRecipes, setFavoriteRecipes] = useState<string[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)
  const [badges, setBadges] = useState<AchievementBadge[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Load all user data
  const loadUserData = useCallback(async () => {
    if (!user) {
      setProfile(null)
      setCompletedResources([])
      setBookmarks([])
      setFavoriteRecipes([])
      setNotificationSettings(null)
      setBadges([])
      setLoading(false)
      return
    }

    try {
      // Load profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error loading profile:", profileError)
      } else if (profileData) {
        console.log("Loaded profile data:", profileData)
        setProfile(profileData)
      }

      // Load completed resources
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("resource_id")
        .eq("user_id", user.id)

      if (progressData) {
        setCompletedResources(progressData.map((p) => p.resource_id))
      }

      // Load bookmarks
      const { data: bookmarksData } = await supabase
        .from("user_bookmarks")
        .select("resource_id")
        .eq("user_id", user.id)

      if (bookmarksData) {
        setBookmarks(bookmarksData.map((b) => b.resource_id))
      }

      // Load favorite recipes
      const { data: recipesData } = await supabase
        .from("favorite_recipes")
        .select("recipe_id")
        .eq("user_id", user.id)

      if (recipesData) {
        setFavoriteRecipes(recipesData.map((r) => r.recipe_id))
      }

      // Load notification settings
      const { data: settingsData } = await supabase
        .from("notification_settings")
        .select("*")
        .eq("user_id", user.id)
        .single()

      if (settingsData) {
        setNotificationSettings(settingsData)
      }

      // Load badges
      const { data: badgesData } = await supabase
        .from("user_badges")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false })

      if (badgesData) {
        setBadges(badgesData)
      }

      // Check and award badges on initial load
      if (profileData && progressData) {
        const completedResourceIds = progressData.map((p) => p.resource_id)
        // Check and award badges inline to avoid dependency issues
        const earnedBadges = getEarnedBadges(completedResourceIds, profileData.is_new_coach)
        for (const badge of earnedBadges) {
          const { data: existingBadge } = await supabase
            .from("user_badges")
            .select("id")
            .eq("user_id", user.id)
            .eq("badge_type", badge.badgeType)
            .eq("category", badge.category)
            .single()

          if (!existingBadge) {
            await supabase.from("user_badges").insert({
              user_id: user.id,
              badge_type: badge.badgeType,
              category: badge.category,
            })
          }
        }
        // Reload badges after checking
        const { data: updatedBadgesData } = await supabase
          .from("user_badges")
          .select("*")
          .eq("user_id", user.id)
          .order("earned_at", { ascending: false })
        if (updatedBadgesData) {
          setBadges(updatedBadgesData)
        }
      }
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase])

  // Check and award badges for completed categories
  const checkAndAwardBadges = useCallback(
    async (completedResourceIds: string[], isNewCoach: boolean) => {
      if (!user) return

      const earnedBadges = getEarnedBadges(completedResourceIds, isNewCoach)

      for (const badge of earnedBadges) {
        // Check if badge already exists
        const { data: existingBadge } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", user.id)
          .eq("badge_type", badge.badgeType)
          .eq("category", badge.category)
          .single()

        // If badge doesn't exist, award it
        if (!existingBadge) {
          const { error } = await supabase.from("user_badges").insert({
            user_id: user.id,
            badge_type: badge.badgeType,
            category: badge.category,
          })

          if (!error) {
            // Reload badges to update UI
            const { data: badgesData } = await supabase
              .from("user_badges")
              .select("*")
              .eq("user_id", user.id)
              .order("earned_at", { ascending: false })

            if (badgesData) {
              setBadges(badgesData)
            }
          }
        }
      }
    },
    [user, supabase]
  )

  useEffect(() => {
    loadUserData()
  }, [loadUserData])

  // Toggle completed resource
  const toggleCompletedResource = useCallback(
    async (resourceId: string) => {
      if (!user) return

      const isCompleted = completedResources.includes(resourceId)

      if (isCompleted) {
        const { error } = await supabase
          .from("user_progress")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resourceId)

        if (error) {
          console.error("Error removing completed resource:", error)
          return
        }
        
        setCompletedResources((prev) => prev.filter((id) => id !== resourceId))
      } else {
        const { error } = await supabase.from("user_progress").insert({
          user_id: user.id,
          resource_id: resourceId,
        })

        if (error) {
          console.error("Error adding completed resource:", error)
          return
        }

        const newCompletedResources = [...completedResources, resourceId]
        setCompletedResources(newCompletedResources)

        // Check and award badges after completing a resource
        if (profile) {
          await checkAndAwardBadges(newCompletedResources, profile.is_new_coach)
        }
      }
    },
    [user, completedResources, profile, supabase, checkAndAwardBadges]
  )

  // Toggle bookmark
  const toggleBookmark = useCallback(
    async (resourceId: string) => {
      if (!user) return

      const isBookmarked = bookmarks.includes(resourceId)

      if (isBookmarked) {
        const { error } = await supabase
          .from("user_bookmarks")
          .delete()
          .eq("user_id", user.id)
          .eq("resource_id", resourceId)

        if (!error) {
          setBookmarks((prev) => prev.filter((id) => id !== resourceId))
        }
      } else {
        const { error } = await supabase.from("user_bookmarks").insert({
          user_id: user.id,
          resource_id: resourceId,
        })

        if (!error) {
          setBookmarks((prev) => [...prev, resourceId])
        }
      }
    },
    [user, bookmarks, supabase]
  )

  // Toggle favorite recipe
  const toggleFavoriteRecipe = useCallback(
    async (recipeId: string) => {
      if (!user) return

      const isFavorite = favoriteRecipes.includes(recipeId)

      if (isFavorite) {
        const { error } = await supabase
          .from("favorite_recipes")
          .delete()
          .eq("user_id", user.id)
          .eq("recipe_id", recipeId)

        if (!error) {
          setFavoriteRecipes((prev) => prev.filter((id) => id !== recipeId))
        }
      } else {
        const { error } = await supabase.from("favorite_recipes").insert({
          user_id: user.id,
          recipe_id: recipeId,
        })

        if (!error) {
          setFavoriteRecipes((prev) => [...prev, recipeId])
        }
      }
    },
    [user, favoriteRecipes, supabase]
  )

  // Update profile
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>) => {
      if (!user) return { error: new Error("Not authenticated") }

      const { data, error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single()

      if (!error && data) {
        setProfile(data)
      }

      return { data, error }
    },
    [user, supabase]
  )

  // Update notification settings
  const updateNotificationSettings = useCallback(
    async (updates: Partial<NotificationSettings>) => {
      if (!user) return { error: new Error("Not authenticated") }

      const { data, error } = await supabase
        .from("notification_settings")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single()

      if (!error && data) {
        setNotificationSettings(data)
      }

      return { data, error }
    },
    [user, supabase]
  )

  return {
    profile,
    completedResources,
    bookmarks,
    favoriteRecipes,
    notificationSettings,
    badges,
    loading,
    toggleCompletedResource,
    toggleBookmark,
    toggleFavoriteRecipe,
    updateProfile,
    updateNotificationSettings,
    refreshData: loadUserData,
  }
}

