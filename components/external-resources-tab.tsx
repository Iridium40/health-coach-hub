"use client"

import { useState, useMemo } from "react"
import { ResourceCard } from "@/components/resource-card"
import { useSupabaseData } from "@/hooks/use-supabase-data"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ExternalResourcesTab() {
  const { user } = useAuth()
  const { profile } = useSupabaseData(user)
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  // Memoize resources array to prevent unnecessary re-renders
  const resources = useMemo(() => [
    {
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

  // Define the desired order for categories
  const categoryOrder: string[] = ["Community", "OPTAVIA Resources", "Social Media"]
  
  // Memoize categories to prevent unnecessary re-renders
  const categories = useMemo(() => {
    // Get unique categories from resources
    const availableCategories: string[] = Array.from(
      new Set(resources.map((resource) => resource.category))
    )
    
    // Sort categories according to the desired order, then add any remaining categories
    const orderedCategories = categoryOrder.filter((cat: string) => availableCategories.includes(cat))
    const remainingCategories = availableCategories
      .filter((cat: string) => !categoryOrder.includes(cat))
      .sort()
    
    // Build categories list: always include "All" first, then ordered categories
    return ["All", ...orderedCategories, ...remainingCategories]
  }, [resources])

  // Memoize filtered resources to prevent unnecessary re-renders
  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      if (selectedCategory === "All") return true
      return resource.category === selectedCategory
    })
  }, [resources, selectedCategory])

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

      {/* Resource Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((resource, index) => (
          <ResourceCard
            key={index}
            title={resource.title}
            description={resource.description}
            url={resource.url}
            buttonText={resource.buttonText}
            features={resource.features}
          />
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-12 text-optavia-gray">No resources found in this category.</div>
      )}
    </div>
  )
}

