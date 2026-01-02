"use client"

import { useState, useMemo, useEffect } from "react"
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
import { Pin, X, ExternalLink, Droplets, Dumbbell, Activity, ClipboardList, Users, Wrench } from "lucide-react"
import { ToolCard } from "@/components/coach-tools/tool-card"
import { WaterCalculator } from "@/components/coach-tools/water-calculator"
import { ExerciseGuide } from "@/components/coach-tools/exercise-guide"
import { MetabolicHealthInfo } from "@/components/coach-tools/metabolic-health-info"
import { HealthAssessment } from "@/components/coach-tools/health-assessment"
import { ClientOnboardingLink } from "@/components/coach-tools/client-onboarding-link"
import { ClientTroubleshootingLink } from "@/components/coach-tools/client-troubleshooting-link"

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
    id: "health-assessment",
    title: "Health Assessment Call Checklist",
    description: "Comprehensive checklist and script guide for conducting health assessment calls with prospective clients.",
    icon: ClipboardList,
    component: HealthAssessment,
    expandMode: "dialog" as const,
  },
  {
    id: "client-onboarding",
    title: "Client Onboarding Tool",
    description: "Streamline new client onboarding with templates, checklists, and quick-copy messages.",
    icon: Users,
    component: ClientOnboardingLink,
    expandMode: "dialog" as const,
  },
  {
    id: "client-troubleshooting",
    title: "Client Troubleshooting Guide",
    description: "Quick solutions and scripts for common client issues and challenges.",
    icon: Wrench,
    component: ClientTroubleshootingLink,
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
  const { profile } = useUserData()
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [pinnedIds, setPinnedIds] = useState<string[]>([])

  // Load pinned resources from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pinnedResources")
    if (saved) {
      try {
        setPinnedIds(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to parse pinned resources:", e)
      }
    }
  }, [])

  // Toggle pin status
  const togglePin = (resourceId: string) => {
    const newPinned = pinnedIds.includes(resourceId)
      ? pinnedIds.filter((id) => id !== resourceId)
      : [...pinnedIds, resourceId]
    setPinnedIds(newPinned)
    localStorage.setItem("pinnedResources", JSON.stringify(newPinned))
  }

  // Memoize resources array to prevent unnecessary re-renders
  const resources: Resource[] = useMemo(() => [
    {
      id: "optavia-strong-fb",
      title: "Optavia Strong Facebook Group",
      description: "Join our community of coaches within OPTAVIA. Connect, share experiences, and support each other in building successful coaching businesses.",
      url: "https://www.facebook.com/groups/810104670912639",
      buttonText: "Go to Facebook Group",
      category: "Community",
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
      features: [
        "Recipe videos and cooking tutorials",
        "Coaching tips and strategies",
        "Success stories and transformations",
        "Educational health content",
        "Live events and webinars",
      ],
    },
  ], [profile?.optavia_id])

  // Get pinned resources
  const pinnedResources = useMemo(() => {
    return resources.filter((r) => pinnedIds.includes(r.id))
  }, [resources, pinnedIds])

  // Define the desired order for categories
  const categoryOrder: string[] = ["Coach Tools", "Community", "OPTAVIA Resources", "Social Media"]
  
  // Memoize categories - always include Coach Tools
  const categories = useMemo(() => {
    // Get unique categories from resources
    const availableCategories: string[] = Array.from(
      new Set(resources.map((resource) => resource.category))
    )
    
    // Sort categories according to the desired order, then add any remaining categories
    const orderedCategories = categoryOrder.filter((cat: string) => 
      availableCategories.includes(cat) || cat === "Coach Tools"
    )
    const remainingCategories = availableCategories
      .filter((cat: string) => !categoryOrder.includes(cat))
      .sort()
    
    // Build categories list: always include "All" first, then ordered categories
    return ["All", ...orderedCategories, ...remainingCategories]
  }, [resources])

  // Memoize filtered resources to prevent unnecessary re-renders
  const filteredResources = useMemo(() => {
    if (selectedCategory === "Coach Tools") return []
    return resources.filter((resource) => {
      if (selectedCategory === "All") return true
      return resource.category === selectedCategory
    })
  }, [resources, selectedCategory])

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

      {/* Quick Links Bar */}
      {pinnedResources.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Pin className="h-4 w-4 text-[hsl(var(--optavia-green))]" />
            <h3 className="text-sm font-semibold text-optavia-dark">Quick Links</h3>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {pinnedResources.map((resource) => (
              <Card
                key={resource.id}
                className="flex-shrink-0 bg-[hsl(var(--optavia-green-light))] border-[hsl(var(--optavia-green))] hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-2 p-2 pr-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-[hsl(var(--optavia-green))] hover:text-red-500 hover:bg-red-50"
                    onClick={() => togglePin(resource.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm font-medium text-optavia-dark hover:text-[hsl(var(--optavia-green))] transition-colors"
                  >
                    {resource.title}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

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
      {showCoachTools && (
        <div className="mb-8">
          {selectedCategory === "All" && (
            <h3 className="font-heading font-semibold text-lg text-optavia-dark mb-4 flex items-center gap-2">
              <Dumbbell className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              Coach Tools
            </h3>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {COACH_TOOLS.map((tool) => (
              <ToolCard
                key={tool.id}
                id={tool.id}
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                expandMode={tool.expandMode || "dialog"}
              >
                {tool.component && <tool.component />}
              </ToolCard>
            ))}
          </div>
        </div>
      )}

      {/* Resource Cards */}
      {filteredResources.length > 0 && (
        <>
          {selectedCategory === "All" && (
            <h3 className="font-heading font-semibold text-lg text-optavia-dark mb-4 flex items-center gap-2">
              <ExternalLink className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
              External Resources
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

      {filteredResources.length === 0 && selectedCategory !== "All" && selectedCategory !== "Coach Tools" && (
        <div className="text-center py-12 text-optavia-gray">No resources found in this category.</div>
      )}
    </div>
  )
}
