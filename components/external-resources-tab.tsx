"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { ResourceCard } from "@/components/resource-card"
import { useUserData } from "@/contexts/user-data-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pin, X, ExternalLink, Droplets, Dumbbell, Activity, ClipboardList, Users, Wrench, Share2, BookOpen, Search } from "lucide-react"
import { SearchWithHistory } from "@/components/search-with-history"
import { ToolCard } from "@/components/coach-tools/tool-card"
import { WaterCalculator } from "@/components/coach-tools/water-calculator"
import { ExerciseGuide } from "@/components/coach-tools/exercise-guide"
import { MetabolicHealthInfo } from "@/components/coach-tools/metabolic-health-info"
import { HealthAssessment } from "@/components/coach-tools/health-assessment"
import { ClientOnboardingDialog } from "@/components/coach-tools/client-onboarding-dialog"
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
  features: string[]
}

// Coach Tools definitions
const COACH_TOOLS = [
  {
    id: "client-onboarding",
    title: "Client Onboarding Tool",
    description: "Streamline new client onboarding with templates, checklists, and quick-copy messages.",
    icon: Users,
    component: ClientOnboardingDialog,
    expandMode: "dialog" as const,
  },
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
  {
    id: "health-assessment",
    title: "Setting Your Clients Up for Success",
    description: "Complete checklist for launching new clients including initial order, kickoff videos, FAQ texts, and ongoing check-ins.",
    icon: ClipboardList,
    component: HealthAssessment,
    expandMode: "dialog" as const,
  },
]

export function ExternalResourcesTab() {
  const { profile } = useUserData()
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category")
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryParam || "All")
  const [pinnedIds, setPinnedIds] = useState<string[]>([])
  const [pinnedToolIds, setPinnedToolIds] = useState<string[]>([])
  const [dbResources, setDbResources] = useState<DBExternalResource[]>([])
  const [loadingResources, setLoadingResources] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Fetch resources from database
  useEffect(() => {
    const fetchResources = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("external_resources")
        .select("*")
        .eq("is_active", true)
        .order("category", { ascending: true })
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

  // Load pinned resources and tools from localStorage on mount (Safari-safe)
  useEffect(() => {
    // Safety check for localStorage availability (Safari private mode, etc.)
    const isLocalStorageAvailable = () => {
      try {
        const testKey = "__test__"
        window.localStorage.setItem(testKey, testKey)
        window.localStorage.removeItem(testKey)
        return true
      } catch (e) {
        return false
      }
    }

    if (!isLocalStorageAvailable()) {
      console.warn("localStorage not available (possibly Safari private mode)")
      return
    }

    try {
      const savedResources = localStorage.getItem("pinnedResources")
      if (savedResources) {
        const parsed = JSON.parse(savedResources)
        if (Array.isArray(parsed)) {
          setPinnedIds(parsed)
        }
      }
    } catch (e) {
      console.error("Failed to parse pinned resources:", e)
    }
    
    try {
      const savedTools = localStorage.getItem("pinnedTools")
      if (savedTools) {
        const parsed = JSON.parse(savedTools)
        if (Array.isArray(parsed)) {
          setPinnedToolIds(parsed)
        }
      }
    } catch (e) {
      console.error("Failed to parse pinned tools:", e)
    }
  }, [])

  // Toggle pin status for resources (Safari-safe)
  const togglePin = (resourceId: string) => {
    const newPinned = pinnedIds.includes(resourceId)
      ? pinnedIds.filter((id) => id !== resourceId)
      : [...pinnedIds, resourceId]
    setPinnedIds(newPinned)
    try {
      localStorage.setItem("pinnedResources", JSON.stringify(newPinned))
    } catch (e) {
      console.warn("Failed to save pinned resources to localStorage:", e)
    }
  }

  // Toggle pin status for tools (Safari-safe)
  const toggleToolPin = (toolId: string) => {
    const newPinned = pinnedToolIds.includes(toolId)
      ? pinnedToolIds.filter((id) => id !== toolId)
      : [...pinnedToolIds, toolId]
    setPinnedToolIds(newPinned)
    try {
      localStorage.setItem("pinnedTools", JSON.stringify(newPinned))
    } catch (e) {
      console.warn("Failed to save pinned tools to localStorage:", e)
    }
  }

  // Convert database resources to the Resource format (preserving sort_order)
  const dbResourcesConverted: (Resource & { sort_order: number })[] = useMemo(() => {
    return dbResources.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      url: r.is_dynamic && r.url.includes("{optavia_id}") && profile?.optavia_id
        ? r.url.replace("{optavia_id}", profile.optavia_id)
        : r.url,
      buttonText: r.button_text,
      category: r.category,
      features: r.features || [],
      sort_order: r.sort_order,
    })).filter(r => {
      // Filter out dynamic resources if user doesn't meet the condition
      const dbResource = dbResources.find(db => db.id === r.id)
      if (dbResource?.show_condition === "optavia_id" && !profile?.optavia_id) {
        return false
      }
      return true
    })
  }, [dbResources, profile?.optavia_id])

  // Static resources that are always available (fallback/built-in resources)
  // These have high sort_order values so DB resources appear first within each category
  const staticResources: (Resource & { sort_order: number })[] = useMemo(() => [
    {
      id: "optavia-strong-fb",
      title: "Optavia Strong Facebook Group",
      description: "Join our community of coaches within OPTAVIA. Connect, share experiences, and support each other in building successful coaching businesses.",
      url: "https://www.facebook.com/groups/810104670912639",
      buttonText: "Go to Facebook Group",
      category: "Community",
      sort_order: 100,
      features: [
        "Connect with fellow coaches",
        "Share best practices and tips",
        "Get support and encouragement",
        "Stay updated on community events",
        "Build your coaching network",
      ],
    },
    {
      id: "healthy-edge-team",
      title: "Healthy Edge 3.0 Team Page",
      description: "Welcome to Healthy Edge 3.0! Where legacy meets fresh momentum, and a brand-new chapter begins.",
      url: "https://www.facebook.com/groups/2156291101444241",
      buttonText: "Join Team Page",
      category: "Community",
      sort_order: 101,
      features: [
        "Team updates and announcements",
        "Fresh momentum and new beginnings",
        "Connect with Healthy Edge team members",
        "Legacy community support",
        "Exclusive team resources",
      ],
    },
    {
      id: "healthy-edge-client",
      title: "Healthy Edge 3.0 Client Page",
      description: "Welcome to Healthy Edge 3.0 — our new, energized, and improved client community page!",
      url: "https://www.facebook.com/groups/778947831962215",
      buttonText: "Join Client Page",
      category: "Community",
      sort_order: 102,
      features: [
        "Client community and support",
        "Share success stories and wins",
        "Energized and improved community",
        "Connect with fellow clients",
        "Inspiration and motivation",
      ],
    },
    {
      id: "optavia-connect",
      title: "OPTAVIA Connect",
      description: "Access your OPTAVIA Connect portal to manage your business, track your progress, and access exclusive resources for coaches.",
      url: "https://optaviaconnect.com/login",
      buttonText: "Go to OPTAVIA Connect",
      category: "OPTAVIA Resources",
      sort_order: 100,
      features: [
        "Business performance tracking and analytics",
        "Client management tools and resources",
        "Training materials and certifications",
        "Marketing resources and support",
        "Commission and earnings information",
      ],
    },
    ...(profile?.optavia_id
      ? [
          {
            id: "optavia-profile",
            title: "OPTAVIA Profile",
            description: "View your OPTAVIA coach profile page to showcase your coaching business and connect with potential clients.",
            url: `https://www.optavia.com/us/en/coach/${profile.optavia_id}`,
            buttonText: "View My OPTAVIA Profile",
            category: "OPTAVIA Resources",
            sort_order: 101,
            features: [
              "Public coach profile page",
              "Share your coaching journey and story",
              "Connect with potential clients",
              "Build your coaching network",
              "Showcase your achievements and success",
            ],
          },
        ]
      : []),
    {
      id: "optavia-blog",
      title: "OPTAVIA Blog",
      description: "Discover helpful articles, tips, and insights to support your coaching journey and help your clients live their Lean & Green Life™.",
      url: "https://www.optaviablog.com",
      buttonText: "Visit OPTAVIA Blog",
      category: "OPTAVIA Resources",
      sort_order: 102,
      features: [
        "Lean & Green meal recipes and tips",
        "Weight loss strategies and motivation",
        "Metabolic health insights",
        "Healthy lifestyle tips and habits",
        "Success stories and inspiration",
      ],
    },
    {
      id: "habits-of-health",
      title: "Habits of Health",
      description: "Access Dr. A's Habits of Health system including daily tips, health assessments, the LifeBook, and transformational resources for whole-body wellness.",
      url: "https://www.habitsofhealth.com/",
      buttonText: "Visit Habits of Health",
      category: "Habits of Health",
      sort_order: 100,
      features: [
        "Take the health assessment",
        "Download the LifeBook preview",
        "Daily tips and motivation from Dr. A",
        "Join the global Habits of Health community",
        "30-day email health challenge",
        "Blog articles on creating lasting habits",
      ],
    },
    {
      id: "optavia-habits-of-health",
      title: "OPTAVIA Habits of Health System",
      description: "The official OPTAVIA Habits of Health Transformational System covering the six habits: Weight Management, Eating & Hydration, Motion, Sleep, Mind, and Surroundings.",
      url: "https://www.optavia.com/us/en/habits-of-health",
      buttonText: "Learn the 6 Habits",
      category: "Habits of Health",
      sort_order: 101,
      features: [
        "Six Habits of Health framework",
        "Habit tracking in the OPTAVIA app",
        "Micro-habits approach for lasting change",
        "Evidence-based behavior change system",
        "Holistic wellness beyond just nutrition",
        "Developed by Dr. Wayne Scott Andersen",
      ],
    },
    {
      id: "optavia-fb",
      title: "OPTAVIA Facebook",
      description: "Follow OPTAVIA on Facebook for the latest updates, success stories, and community engagement.",
      url: "https://www.facebook.com/optavia",
      buttonText: "Go to Facebook Page",
      category: "Social Media",
      sort_order: 100,
      features: [
        "Latest OPTAVIA news and updates",
        "Success stories and testimonials",
        "Community engagement and discussions",
        "Health and wellness tips",
        "Event announcements and promotions",
      ],
    },
    {
      id: "optavia-ig",
      title: "OPTAVIA Instagram",
      description: "Get inspired by OPTAVIA's Instagram feed featuring healthy recipes, transformation stories, and lifestyle tips.",
      url: "https://www.instagram.com/optavia",
      buttonText: "Go to Instagram Page",
      category: "Social Media",
      sort_order: 101,
      features: [
        "Visual inspiration and recipes",
        "Transformation stories and testimonials",
        "Healthy lifestyle tips and tricks",
        "Behind-the-scenes content",
        "Community highlights and features",
      ],
    },
    {
      id: "optavia-yt",
      title: "OPTAVIA YouTube",
      description: "Watch OPTAVIA videos including recipes, coaching tips, success stories, and educational content.",
      url: "https://www.youtube.com/optavia",
      buttonText: "Visit YouTube Channel",
      category: "Social Media",
      sort_order: 102,
      features: [
        "Recipe videos and cooking tutorials",
        "Coaching tips and strategies",
        "Success stories and transformations",
        "Educational health content",
        "Live events and webinars",
      ],
    },
  ], [profile?.optavia_id])

  // Combine database resources with static resources (DB resources take priority)
  // Sort by category first, then by sort_order within each category
  const resources: (Resource & { sort_order: number })[] = useMemo(() => {
    // DB resources override static resources with the same ID
    const dbIds = new Set(dbResourcesConverted.map(r => r.id))
    const filteredStatic = staticResources.filter(r => !dbIds.has(r.id))
    const combined = [...dbResourcesConverted, ...filteredStatic]
    
    // Sort by category, then by sort_order
    return combined.sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category)
      }
      return a.sort_order - b.sort_order
    })
  }, [dbResourcesConverted, staticResources])

  // Get pinned resources
  const pinnedResources = useMemo(() => {
    return resources.filter((r) => pinnedIds.includes(r.id))
  }, [resources, pinnedIds])

  // Get pinned tools
  const pinnedTools = useMemo(() => {
    return COACH_TOOLS.filter((t) => pinnedToolIds.includes(t.id))
  }, [pinnedToolIds])

  // Get unique categories from all resources (including DB resources)
  const allResourceCategories = useMemo(() => {
    const cats = new Set(resources.map(r => r.category))
    return Array.from(cats).sort()
  }, [resources])

  // Simplified category order per Phase 4 of UX redesign + Training if present
  const categories = useMemo(() => {
    const baseCategories = ["All", "Coach Tools", "OPTAVIA Portals", "Communities"]
    // Add Training if there are training resources
    if (allResourceCategories.includes("Training")) {
      baseCategories.push("Training")
    }
    // Add any other custom categories from the database
    allResourceCategories.forEach(cat => {
      if (!["Community", "OPTAVIA Resources", "Habits of Health", "Social Media", "Training", "Other"].includes(cat)) {
        if (!baseCategories.includes(cat)) {
          baseCategories.push(cat)
        }
      }
    })
    // Add "Other" at the end if present
    if (allResourceCategories.includes("Other") && !baseCategories.includes("Other")) {
      baseCategories.push("Other")
    }
    return baseCategories
  }, [allResourceCategories])

  // Memoize filtered resources with simplified category mapping and search
  // Resources are already sorted by category and sort_order from the combined array
  const filteredResources = useMemo(() => {
    if (selectedCategory === "Coach Tools") return []
    const filtered = resources.filter((resource) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.features.some(f => f.toLowerCase().includes(query))
        if (!matchesSearch) return false
      }
      
      // Apply category filter
      if (selectedCategory === "All") return true
      // Map simplified categories to original categories
      if (selectedCategory === "OPTAVIA Portals") {
        return resource.category === "OPTAVIA Resources" || resource.category === "Habits of Health" || resource.category === "Social Media"
      }
      if (selectedCategory === "Communities") {
        return resource.category === "Community"
      }
      if (selectedCategory === "Training") {
        return resource.category === "Training"
      }
      if (selectedCategory === "Other") {
        return resource.category === "Other"
      }
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
                isPinned={pinnedToolIds.includes(tool.id)}
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
              OPTAVIA & Community
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
                isPinned={pinnedIds.includes(resource.id)}
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
