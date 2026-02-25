import type { Module } from "@/lib/types"
import type { TrainingResource } from "@/hooks/use-training-resources"

export type DashboardSearchSourceType =
  | "training"
  | "resource"
  | "dashboard_button"
  | "client_resource"

export interface DashboardSearchItem {
  id: string
  sourceType: DashboardSearchSourceType
  title: string
  description: string
  tags: string[]
  category?: string
  keywords: string[]
  href?: string
  actionType?: "link" | "modal"
  actionId?: string
}

export interface DashboardSearchMetadataItem {
  id: string
  title: string
  description?: string
  tags?: string[]
  category?: string
  href?: string
}

const normalize = (value: string) => value.toLowerCase().trim()

const dedupeKeywords = (parts: Array<string | undefined | null>) => {
  const seen = new Set<string>()
  for (const p of parts) {
    if (!p) continue
    const normalized = normalize(p)
    if (!normalized) continue
    seen.add(normalized)
  }
  return Array.from(seen)
}

export const scoreDashboardSearchItem = (item: DashboardSearchItem, query: string) => {
  const q = normalize(query)
  if (!q) return 0

  const title = normalize(item.title)
  const description = normalize(item.description)
  const keywords = item.keywords.join(" ")

  if (title === q) return 120
  if (title.startsWith(q)) return 90
  if (title.includes(q)) return 70
  if (item.tags.some((tag) => normalize(tag).includes(q))) return 55
  if (keywords.includes(q)) return 45
  if (description.includes(q)) return 30
  return 0
}

export const mapTrainingToSearchItems = (
  modules: Module[],
  trainingResources: TrainingResource[]
): DashboardSearchItem[] => {
  const moduleItems: DashboardSearchItem[] = modules.map((module) => {
    const resourceTitles = module.resources.map((r) => r.title)
    const tags = [module.category, "training", "module"]
    return {
      id: `training-module-${module.id}`,
      sourceType: "training",
      title: module.title,
      description: module.description || "Training module",
      tags: tags.filter(Boolean) as string[],
      category: module.category,
      keywords: dedupeKeywords([
        module.title,
        module.description,
        module.category,
        ...resourceTitles,
      ]),
      href: "/training",
      actionType: "link",
    }
  })

  const resourceItems: DashboardSearchItem[] = trainingResources.map((resource) => {
    const tags = [resource.category, resource.type, "training", "resource"]
    return {
      id: `training-resource-${resource.id}`,
      sourceType: "training",
      title: resource.title,
      description: resource.description || `${resource.category} resource`,
      tags: tags.filter(Boolean) as string[],
      category: resource.category,
      keywords: dedupeKeywords([
        resource.title,
        resource.description || "",
        resource.category,
        resource.type,
      ]),
      href: resource.url,
      actionType: "link",
    }
  })

  return [...moduleItems, ...resourceItems]
}

export const mapMetadataItemsToSearchItems = (
  sourceType: DashboardSearchSourceType,
  items: DashboardSearchMetadataItem[],
  defaults?: { actionType?: "link" | "modal"; extraTags?: string[] }
): DashboardSearchItem[] => {
  return items.map((item) => {
    const tags = [...(item.tags || []), ...(defaults?.extraTags || [])]
    return {
      id: `${sourceType}-${item.id}`,
      sourceType,
      title: item.title,
      description: item.description || item.category || "Resource",
      tags,
      category: item.category,
      keywords: dedupeKeywords([
        item.title,
        item.description,
        item.category,
        ...(item.tags || []),
      ]),
      href: item.href,
      actionType: defaults?.actionType || "link",
      actionId: item.id,
    }
  })
}

