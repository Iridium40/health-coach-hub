import { modules } from "./data"
import type { Module } from "./types"

/**
 * Check if a user has completed all resources in a specific category
 */
export function isCategoryComplete(
  category: string,
  completedResourceIds: string[],
  isNewCoach: boolean
): boolean {
  // Get all modules in this category
  const categoryModules = modules.filter((module) => {
    // Filter by category
    if (module.category !== category) return false
    // Filter by new coach status if applicable
    if (isNewCoach && !module.forNewCoach) return false
    return true
  })

  // Get all resource IDs in this category
  const categoryResourceIds = categoryModules.flatMap((module) =>
    module.resources.map((resource) => resource.id)
  )

  // Check if all resources are completed
  if (categoryResourceIds.length === 0) return false

  return categoryResourceIds.every((resourceId) => completedResourceIds.includes(resourceId))
}

/**
 * Get all available categories
 */
export function getAvailableCategories(isNewCoach: boolean): string[] {
  const availableModules = modules.filter((module) => {
    if (isNewCoach && !module.forNewCoach) return false
    return true
  })

  return Array.from(new Set(availableModules.map((module) => module.category)))
}

/**
 * Check which categories are complete and return badge data
 */
export function getEarnedBadges(
  completedResourceIds: string[],
  isNewCoach: boolean
): Array<{ category: string; badgeType: string }> {
  const categories = getAvailableCategories(isNewCoach)
  const earnedBadges: Array<{ category: string; badgeType: string }> = []

  categories.forEach((category) => {
    if (isCategoryComplete(category, completedResourceIds, isNewCoach)) {
      earnedBadges.push({
        category,
        badgeType: "category_complete",
      })
    }
  })

  return earnedBadges
}

