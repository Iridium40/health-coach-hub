"use client"

import { useState, useEffect, useCallback, useRef, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { getEarnedBadges } from "@/lib/badges"
import { sendBadgeEmail } from "@/lib/email"
import { badgeConfig } from "@/lib/badge-config"

export interface UserProfile {
  id: string
  user_id: string | null
  email: string | null
  full_name: string | null
  avatar_url: string | null
  is_new_coach: boolean
  user_role: string | null
  coach_rank: string | null
  optavia_id: string | null
  sponsor_id: string | null
  phone_number: string | null
  notification_email: string | null
  notification_phone: string | null
  org_id: number | null
  last_sign_in_at: string | null
  zoom_link: string | null
  zoom_meeting_id: string | null
  zoom_passcode: string | null
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
  // Memoize supabase client to prevent re-creation on every render
  const supabase = useMemo(() => createClient(), [])
  const loadingRef = useRef(false)
  const loadedUserIdRef = useRef<string | null>(null)

  // Load all user data
  const loadUserData = useCallback(async (forceRefresh = false) => {
    // Prevent concurrent calls
    if (loadingRef.current) {
      return
    }
    
    // Skip if already loaded for this user (unless forced)
    if (!forceRefresh && user && loadedUserIdRef.current === user.id) {
      setLoading(false)
      return
    }
    
    loadingRef.current = true
    setLoading(true)
    
    if (!user) {
      setProfile(null)
      setCompletedResources([])
      setBookmarks([])
      setFavoriteRecipes([])
      setNotificationSettings(null)
      setBadges([])
      setLoading(false)
      loadingRef.current = false
      loadedUserIdRef.current = null
      return
    }

    try {
      // Load all user data in parallel for better performance
      const [
        profileResult,
        progressResult,
        bookmarksResult,
        recipesResult,
        settingsResult,
        badgesResult,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("user_progress").select("resource_id").eq("user_id", user.id),
        supabase.from("user_bookmarks").select("resource_id").eq("user_id", user.id),
        supabase.from("favorite_recipes").select("recipe_id").eq("user_id", user.id),
        supabase.from("notification_settings").select("*").eq("user_id", user.id).single(),
        supabase.from("user_badges").select("*").eq("user_id", user.id).order("earned_at", { ascending: false }),
      ])

      // Process profile
      const { data: profileData, error: profileError } = profileResult
      if (profileError && profileError.code !== "PGRST116") {
        console.error("Error loading profile:", profileError)
      } else if (profileData) {
        setProfile(profileData)
      }

      // Process completed resources
      const { data: progressData } = progressResult
      if (progressData) {
        setCompletedResources(progressData.map((p) => p.resource_id))
      }

      // Process bookmarks
      const { data: bookmarksData } = bookmarksResult
      if (bookmarksData) {
        setBookmarks(bookmarksData.map((b) => b.resource_id))
      }

      // Process favorite recipes
      const { data: recipesData } = recipesResult
      if (recipesData) {
        setFavoriteRecipes(recipesData.map((r) => r.recipe_id))
      }

      // Process notification settings
      const { data: settingsData } = settingsResult
      if (settingsData) {
        setNotificationSettings(settingsData)
      }

      // Process badges
      const { data: badgesData } = badgesResult
      if (badgesData) {
        setBadges(badgesData)
      }

      // Mark as loaded for this user
      loadedUserIdRef.current = user.id
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [user, supabase])

  // Check and award badges for completed categories
  const checkAndAwardBadges = useCallback(
    async (completedResourceIds: string[], isNewCoach: boolean) => {
      if (!user || !profile) return

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

            // Send badge award email if user has email and email notifications enabled
            if (profile.email && notificationSettings?.email_notifications) {
              const badgeInfo = badgeConfig[badge.category]
              if (badgeInfo) {
                await sendBadgeEmail({
                  to: profile.email,
                  fullName: profile.full_name || "Coach",
                  badgeName: badgeInfo.name,
                  badgeCategory: badge.category,
                  badgeDescription: badgeInfo.description,
                })
              }
            }
          }
        }
      }
    },
    [user, profile, notificationSettings, supabase]
  )

  useEffect(() => {
    // Reset loading ref when user changes
    if (user?.id !== loadedUserIdRef.current) {
      loadingRef.current = false
      loadedUserIdRef.current = null
    }
    loadUserData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

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

