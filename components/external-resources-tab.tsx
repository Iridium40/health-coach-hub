"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { ResourceCard } from "@/components/resource-card"
import { useUserData } from "@/contexts/user-data-context"
import { useBookmarks } from "@/hooks/use-bookmarks"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pin, X, ExternalLink, Droplets, Dumbbell, Activity, Users, Wrench, Share2, BookOpen, Search } from "lucide-react"
import { SearchWithHistory } from "@/components/search-with-history"
import { ToolCard } from "@/components/coach-tools/tool-card"
import { WaterCalculator } from "@/components/coach-tools/water-calculator"
import { ExerciseGuide } from "@/components/coach-tools/exercise-guide"
import { MetabolicHealthInfo } from "@/components/coach-tools/metabolic-health-info"
import { ClientTroubleshootingDialog } from "@/components/coach-tools/client-troubleshooting-dialog"
import { SocialMediaPromptGenerator } from "@/components/social-media-prompt-generator"
import { OPTAVIAReferenceGuide } from "@/components/coach-tools/optavia-reference-guide"
import { createClient } from "@/lib/supabase/client"
import type { ExternalResource as DBExternalResource } from "@/lib/types"

interface Resource {
  id: string
  title: string
  description: string
  url: string
  buttonText: string
  category: string
  features: string[] | { tags?: string[]; type?: string; [key: string]: any } | null
}

// Coach Tools definitions
const COACH_TOOLS = [
  {
    id: "client-troubleshooting",
    title: "Client Troubleshooting Guide",
    description: "Quick solutions and scripts for common client issues and challenges.",
    icon: Wrench,
    component: ClientTroubleshootingDialog,
    expandMode: "dialog" as const,
  },
  {
    id: "social-media-generator",
    title: "Social Media Post Generator",
    description: "Build prompts for ChatGPT to generate 3 unique social media post ideas instantly.",
    icon: Share2,
    component: SocialMediaPromptGenerator,
    expandMode: "dialog" as const,
  },
  {
    id: "optavia-reference",
    title: "Condiments Quick Reference Guide",
    description: "Comprehensive guide to healthy fats, salad dressings, condiments, and portion sizes for the 5 & 1 Plan.",
    icon: BookOpen,
    component: OPTAVIAReferenceGuide,
    expandMode: "dialog" as const,
  },
  {
    id: "water-calculator",
    title: "Water Intake Calculator",
    description: "Calculate personalized daily water intake goals for your clients based on weight and activity level.",
    icon: Droplets,
    component: WaterCalculator,
  },
  {
    id: "exercise-guide",
    title: "Exercise & Motion Guide",
    description: "Weekly workout plans, OPTAVIA ACTIVE products, and motion tips for all fitness levels.",
    icon: Dumbbell,
    component: ExerciseGuide,
  },
  {
    id: "metabolic-health",
    title: "Metabolic Health Education",
    description: "Key information about metabolic health, talking points, and how OPTAVIA supports wellness.",
    icon: Activity,
    component: MetabolicHealthInfo,
  },
]

export function ExternalResourcesTab() {
  const { user, profile } = useUserData()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "All")
  const [dbResources, setDbResources] = useState<DBExternalResource[]>([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const {
    isBookmarked: isResourcePinned,
    toggleBookmark: togglePin,
    getBookmarkedIds: getPinnedResourceIds,
  } = useBookmarks(user, "resource")

  const {
    isBookmarked: isToolPinned,
    toggleBookmark: toggleToolPin,
    getBookmarkedIds: getPinnedToolIds,
  } = useBookmarks(user, "coach_tool")

  // Fetch resources from database
  useEffect(() => {
    const fetchResources = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("external_resources")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })

      if (!error && data) {
        setDbResources(data)
      }
      setLoadingResources(false)
    }

    fetchResources()
  }, [])

  // Sync selectedCategory with URL parameter when it changes
  useEffect(() => {
    if (categoryParam && categoryParam !== selectedCategory) {
      setSelectedCategory(categoryParam)
    }
  }, [categoryParam])

  // Convert database resources to the Resource format (preserving sort_order)
  // All resources now come from the database and can be managed via admin panel
  const resources: (Resource & { sort_order: number })[] = useMemo(() => {
    return dbResources.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      url: r.is_dynamic && r.url.includes("{optavia_id}") && profile?.optavia_id
        ? r.url.replace("{optavia_id}", profile.optavia_id)
        : r.url,
      buttonText: r.button_text,
      category: r.category,
      features: r.features,
      sort_order: r.sort_order,
    })).filter(r => {
      // Filter out dynamic resources if user doesn't meet the condition
      const dbResource = dbResources.find(db => db.id === r.id)
      if (dbResource?.show_condition === "optavia_id" && !profile?.optavia_id) {
        return false
      }
      return true
    }).sort((a, b) => a.sort_order - b.sort_order)
  }, [dbResources, profile?.optavia_id])

  const pinnedResourceIds = getPinnedResourceIds()
  const pinnedToolIds = getPinnedToolIds()

  // Get pinned resources
  const pinnedResources = useMemo(() => {
    return resources.filter((r) => pinnedResourceIds.includes(r.id))
  }, [resources, pinnedResourceIds])

  // Get pinned tools
  const pinnedTools = useMemo(() => {
    return COACH_TOOLS.filter((t) => pinnedToolIds.includes(t.id))
  }, [pinnedToolIds])

  // Resource categories - includes all database categories plus Coach Tools
  const categories = [
    "All",
    "Coach Tools",
    // Getting Started & Business
    "Getting Started",
    "Tax & Finance",
    "Business Development",
    // Client Journey
    "Journey Kickoff",
    "Client Text Templates",
    "Client Support",
    "Client Support Videos",
    // Nutrition & Health
    "Nutrition Guides",
    // Social & Marketing
    "Social Media Strategy",
    // Mindset & Growth
    "Troubleshooting",
    "Coaching Real Talk",
    // Legacy categories
    "OPTAVIA Portals",
    "Social Media",
    "Communities",
    "Training",
  ]

  // Memoize filtered resources with search
  const filteredResources = useMemo(() => {
    if (selectedCategory === "Coach Tools") return []
    const filtered = resources.filter((resource) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        // Search in title, description, category, and tags
        // Handle both legacy array format and new JSONB object format
        const tags = Array.isArray(resource.features) 
          ? resource.features 
          : (resource.features?.tags && Array.isArray(resource.features.tags))
            ? resource.features.tags 
            : []
        const matchesSearch = 
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.category.toLowerCase().includes(query) ||
          tags.some((t: string) => t.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }
      
      // Apply category filter
      if (selectedCategory === "All") return true
      return resource.category === selectedCategory
    })
    // Sort by sort_order within the filtered results
    return filtered.sort((a, b) => a.sort_order - b.sort_order)
  }, [resources, selectedCategory, searchQuery])

  // Filter coach tools by search query
  const filteredCoachTools = useMemo(() => {
    if (!searchQuery) return COACH_TOOLS
    const query = searchQuery.toLowerCase()
    return COACH_TOOLS.filter(tool => 
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query)
    )
  }, [searchQuery])

  // Generate search suggestions from resource titles, descriptions, and tool names
  const searchSuggestions = useMemo(() => {
    const suggestions: Set<string> = new Set()
    
    // Add resource titles
    resources.forEach((resource) => {
      suggestions.add(resource.title)
      // Add key words from description (first few words)
      const descWords = resource.description.split(" ").slice(0, 4).join(" ")
      if (descWords.length > 5) {
        suggestions.add(descWords)
      }
    })
    
    // Add coach tool titles
    COACH_TOOLS.forEach((tool) => {
      suggestions.add(tool.title)
    })
    
    // Add common keywords
    suggestions.add("OPTAVIA")
    suggestions.add("Facebook")
    suggestions.add("Instagram")
    suggestions.add("YouTube")
    suggestions.add("Training")
    suggestions.add("Calculator")
    suggestions.add("Health")
    suggestions.add("Coach")
    
    return Array.from(suggestions)
  }, [resources])

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  // Check if we should show coach tools
  const showCoachTools = selectedCategory === "All" || selectedCategory === "Coach Tools"

  return (
    <div>
      {/* Title and Description */}
      <div className="text-center py-4 sm:py-8 mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-3 sm:mb-4">
          Resources
        </h2>
        <p className="text-optavia-gray text-base sm:text-lg max-w-2xl mx-auto px-4">
          Access external resources, tools, and communities to support your coaching journey and help your clients succeed.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="max-w-md">
          <SearchWithHistory
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search resources and tools..."
            suggestions={searchSuggestions}
            storageKey="resources"
          />
        </div>
        {/* Search Results Summary */}
        {searchQuery && (
          <div className="mt-2 text-sm text-optavia-gray">
            Found {filteredCoachTools.length + filteredResources.length} results for "{searchQuery}"
            {filteredCoachTools.length > 0 && filteredResources.length > 0 && (
              <span> ({filteredCoachTools.length} tools, {filteredResources.length} resources)</span>
            )}
          </div>
        )}
      </div>

      {/* Category Filter - Mobile Dropdown */}
      <div className="md:hidden mb-6">
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full border-2 border-gray-300 text-optavia-dark bg-white hover:border-[hsl(var(--optavia-green))] focus:border-[hsl(var(--optavia-green))] focus:ring-[hsl(var(--optavia-green-light))]">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent className="bg-white text-optavia-dark">
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter - Desktop Buttons */}
      <div className="hidden md:flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className={
              selectedCategory === category
                ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                : "border-gray-300 text-optavia-dark hover:bg-gray-100 hover:border-[hsl(var(--optavia-green))] hover:text-[hsl(var(--optavia-green))] bg-white"
            }
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Coach Tools Section */}
      {showCoachTools && filteredCoachTools.length > 0 && (
        <div className="mb-8">
          {selectedCategory === "All" && (
            <h3 className="font-heading font-semibold text-lg text-optavia-dark mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Coach Tools
              {searchQuery && <span className="text-sm font-normal text-optavia-gray">({filteredCoachTools.length} results)</span>}
            </h3>
          )}
          {selectedCategory === "Coach Tools" && (
            <h3 className="font-heading font-semibold text-lg text-optavia-dark mb-4 flex items-center gap-2">
              <Wrench className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Coach Tools
              {searchQuery && <span className="text-sm font-normal text-optavia-gray">({filteredCoachTools.length} results)</span>}
            </h3>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCoachTools.map((tool) => (
              <ToolCard
                key={tool.id}
                id={tool.id}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                expandMode={tool.expandMode || "dialog"}
                isPinned={isToolPinned(tool.id)}
                onTogglePin={() => toggleToolPin(tool.id)}
              >
                {tool.component && <tool.component />}
              </ToolCard>
            ))}
          </div>
        </div>
      )}

      {/* OPTAVIA & Community Resources */}
      {filteredResources.length > 0 && (
        <>
          {selectedCategory === "All" && (
            <h3 className="font-heading font-semibold text-lg text-optavia-dark mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              External Resources
              {searchQuery && <span className="text-sm font-normal text-optavia-gray">({filteredResources.length} results)</span>}
            </h3>
          )}
          {selectedCategory === "OPTAVIA Portals" && (
            <h3 className="font-heading font-semibold text-lg text-optavia-dark mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              OPTAVIA Portals & Resources
            </h3>
          )}
          {selectedCategory === "Communities" && (
            <h3 className="font-heading font-semibold text-lg text-optavia-dark mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Communities & Groups
            </h3>
          )}
          {selectedCategory === "Training" && (
            <h3 className="font-heading font-semibold text-lg text-optavia-dark mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Training Resources
            </h3>
          )}
          {selectedCategory === "Other" && (
            <h3 className="font-heading font-semibold text-lg text-optavia-dark mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Other Resources
            </h3>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResources.map((resource) => (
              <ResourceCard
                key={resource.id}
                id={resource.id}
                title={resource.title}
                description={resource.description}
                url={resource.url}
                buttonText={resource.buttonText}
                features={resource.features}
                isPinned={isResourcePinned(resource.id)}
                onTogglePin={() => togglePin(resource.id)}
              />
            ))}
          </div>
        </>
      )}

      {/* No Results Message */}
      {filteredResources.length === 0 && filteredCoachTools.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <Search className="h-12 w-12 text-optavia-gray mx-auto mb-4 opacity-50" />
          <p className="text-optavia-gray text-lg">No results found for "{searchQuery}"</p>
          <p className="text-optavia-gray text-sm mt-2">Try adjusting your search terms or clear the search</p>
        </div>
      )}

      {filteredResources.length === 0 && !searchQuery && selectedCategory !== "All" && selectedCategory !== "Coach Tools" && (
        <div className="text-center py-12 text-optavia-gray">No resources found in this category.</div>
      )}
    </div>
  )
}
