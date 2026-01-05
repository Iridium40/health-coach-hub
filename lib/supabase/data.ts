import { createClient } from "./client"
import type { Module, Recipe, Resource } from "@/lib/types"

// Cached data for performance
let cachedModules: Module[] | null = null
let cachedRecipes: Recipe[] | null = null
let modulesLoadPromise: Promise<Module[]> | null = null
let recipesLoadPromise: Promise<Recipe[]> | null = null

/**
 * Fetch all modules with their resources from Supabase
 * Results are cached for the lifetime of the page
 */
export async function getModules(): Promise<Module[]> {
  // Return cached data if available
  if (cachedModules) {
    return cachedModules
  }

  // Return existing promise if already loading
  if (modulesLoadPromise) {
    return modulesLoadPromise
  }

  // Start loading
  modulesLoadPromise = loadModulesFromSupabase()
  cachedModules = await modulesLoadPromise
  modulesLoadPromise = null
  return cachedModules
}

/**
 * Fetch all recipes from Supabase
 * Results are cached for the lifetime of the page unless forceRefresh is true
 */
export async function getRecipes(forceRefresh: boolean = false): Promise<Recipe[]> {
  // Clear cache if force refresh requested
  if (forceRefresh) {
    cachedRecipes = null
    recipesLoadPromise = null
  }

  // Return cached data if available
  if (cachedRecipes) {
    return cachedRecipes
  }

  // Return existing promise if already loading
  if (recipesLoadPromise) {
    return recipesLoadPromise
  }

  // Start loading
  recipesLoadPromise = loadRecipesFromSupabase()
  cachedRecipes = await recipesLoadPromise
  recipesLoadPromise = null
  return cachedRecipes
}

/**
 * Load modules and resources from Supabase
 */
async function loadModulesFromSupabase(): Promise<Module[]> {
  const supabase = createClient()

  // Fetch modules and resources in parallel
  const [modulesResult, resourcesResult] = await Promise.all([
    supabase
      .from("modules")
      .select("*")
      .order("sort_order", { ascending: true }),
    supabase
      .from("module_resources")
      .select("*")
      .order("sort_order", { ascending: true }),
  ])

  if (modulesResult.error) {
    console.log("Modules table not found in Supabase, using static data. Error:", modulesResult.error.message)
    // Fall back to static data
    const { modules } = await import("@/lib/data")
    console.log("Loaded", modules.length, "modules from static data")
    return modules
  }

  if (resourcesResult.error) {
    console.log("Resources table not found in Supabase, using static data. Error:", resourcesResult.error.message)
    // Fall back to static data
    const { modules } = await import("@/lib/data")
    console.log("Loaded", modules.length, "modules from static data")
    return modules
  }

  // If tables exist but are empty, fall back to static data
  if (!modulesResult.data || modulesResult.data.length === 0) {
    console.log("Modules table empty, using static data")
    const { modules } = await import("@/lib/data")
    console.log("Loaded", modules.length, "modules from static data")
    return modules
  }

  // Group resources by module_id
  const resourcesByModule = new Map<string, Resource[]>()
  for (const resource of resourcesResult.data || []) {
    const moduleResources = resourcesByModule.get(resource.module_id) || []
    moduleResources.push({
      id: resource.id,
      title: resource.title,
      type: resource.resource_type as "doc" | "video",
      url: resource.url,
    })
    resourcesByModule.set(resource.module_id, moduleResources)
  }

  // Transform to Module type
  const modules: Module[] = (modulesResult.data || []).map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    category: m.category as Module["category"],
    order: m.sort_order,
    forNewCoach: m.for_new_coach,
    icon: m.icon,
    resources: resourcesByModule.get(m.id) || [],
    required_rank: (m as any).required_rank || null,
  }))

  return modules
}

/**
 * Load recipes from Supabase
 */
async function loadRecipesFromSupabase(): Promise<Recipe[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("recipes")
    .select("*")
    .order("title", { ascending: true })

  if (error) {
    console.log("Recipes table not found in Supabase, using static data. Error:", error.message)
    // Fall back to static data
    const { recipes } = await import("@/lib/data")
    console.log("Loaded", recipes.length, "recipes from static data")
    return recipes
  }

  // If table exists but is empty, fall back to static data
  if (!data || data.length === 0) {
    console.log("Recipes table empty, using static data")
    const { recipes } = await import("@/lib/data")
    console.log("Loaded", recipes.length, "recipes from static data")
    return recipes
  }

  // Transform to Recipe type
  const recipes: Recipe[] = (data || []).map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    image: r.image || "",
    category: r.category as Recipe["category"],
    prepTime: r.prep_time,
    cookTime: r.cook_time,
    servings: r.servings,
    difficulty: r.difficulty as Recipe["difficulty"],
    counts: {
      lean: r.lean_count,
      green: r.green_count,
      fat: r.fat_count,
      condiment: r.condiment_count,
    },
    ingredients: r.ingredients || [],
    instructions: r.instructions || [],
    favoriteCount: r.favorite_count || 0,
  }))

  return recipes
}

/**
 * Clear cached data (useful for testing or forcing refresh)
 */
export function clearDataCache() {
  cachedModules = null
  cachedRecipes = null
  modulesLoadPromise = null
  recipesLoadPromise = null
}

