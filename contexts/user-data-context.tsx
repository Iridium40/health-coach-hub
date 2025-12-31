"use client"

import { createContext, useContext, ReactNode } from "react"
import type { User } from "@supabase/supabase-js"
import { useAuth } from "@/hooks/use-auth"
import { useSupabaseData, UserProfile, NotificationSettings, AchievementBadge } from "@/hooks/use-supabase-data"

interface UserDataContextType {
  // Auth state
  user: User | null
  authLoading: boolean
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signOut: () => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
  
  // User data state
  profile: UserProfile | null
  completedResources: string[]
  bookmarks: string[]
  favoriteRecipes: string[]
  notificationSettings: NotificationSettings | null
  badges: AchievementBadge[]
  loading: boolean
  
  // Actions
  toggleCompletedResource: (resourceId: string) => Promise<void>
  toggleBookmark: (resourceId: string) => Promise<void>
  toggleFavoriteRecipe: (recipeId: string) => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ data?: UserProfile; error?: Error }>
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => Promise<{ data?: NotificationSettings; error?: Error }>
  refreshData: (forceRefresh?: boolean) => Promise<void>
}

const UserDataContext = createContext<UserDataContextType | null>(null)

export function UserDataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading, signUp, signIn, signOut, resetPassword } = useAuth()
  const {
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
    refreshData,
  } = useSupabaseData(user)

  const value: UserDataContextType = {
    // Auth
    user,
    authLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    // Data
    profile,
    completedResources,
    bookmarks,
    favoriteRecipes,
    notificationSettings,
    badges,
    loading,
    // Actions
    toggleCompletedResource,
    toggleBookmark,
    toggleFavoriteRecipe,
    updateProfile,
    updateNotificationSettings,
    refreshData,
  }

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  )
}

export function useUserData() {
  const context = useContext(UserDataContext)
  if (!context) {
    throw new Error("useUserData must be used within UserDataProvider")
  }
  return context
}

