"use client"

import { useState, useMemo, useCallback, memo } from "react"
import { ModuleCard } from "@/components/module-card"
import { SearchWithHistory } from "@/components/search-with-history"
import type { UserData, Module } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { canAccessModule, isAcademyModule, ACADEMY_MODULES, getAcademyProgress } from "@/lib/academy-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Lock, CheckCircle2, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useUserData } from "@/contexts/user-data-context"

interface TrainingTabProps {
  userData: UserData
  setUserData: (data: UserData) => void
  onSelectModule: (module: Module) => void
  modules: Module[]
}

export const TrainingTab = memo(function TrainingTab({ userData, setUserData, onSelectModule, modules }: TrainingTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const { profile } = useUserData()
  const userRank = profile?.coach_rank || null

  // Separate academy modules from regular training modules
  const { academyModules, regularModules } = useMemo(() => {
    const academy: Module[] = []
    const regular: Module[] = []
    
    modules.forEach((module) => {
      // Filter by new coach status for regular modules
      if (userData.isNewCoach && !module.forNewCoach && !isAcademyModule(module.id)) {
        return // Skip this regular module if user is new coach
      }
      
      if (isAcademyModule(module.id)) {
        academy.push(module)
      } else {
        regular.push(module)
      }
    })
    
    return { academyModules: academy, regularModules: regular }
  }, [modules, userData.isNewCoach])
  
  // Get academy progress
  const academyProgress = useMemo(() => {
    return getAcademyProgress(userData.completedResources)
  }, [userData.completedResources])
  
  // Helper to check if a module is locked
  const isModuleLocked = useCallback((module: Module): boolean => {
    if (isAcademyModule(module.id)) {
      return !canAccessModule(userRank, module.required_rank || null)
    }
    return false
  }, [userRank])

  // Memoize categories list (only from regular modules, exclude Academy Course)
  const categories = useMemo(() => {
    // Get unique categories from regular modules only
    const availableCategories: string[] = Array.from(
      new Set(regularModules.map((module) => module.category))
    )

    // Define the desired order for categories (no Academy Course)
    const categoryOrder: string[] = ["Pre Launch (New Coaches)", "Launch Week", "First 30 Days", "Growing to Senior Coach", "Using Connect for Business Success", "Getting Started", "Client Support", "Business Building"]
    
    // Sort categories according to the desired order, then add any remaining categories
    const orderedCategories = categoryOrder.filter((cat: string) => availableCategories.includes(cat))
    const remainingCategories = availableCategories
      .filter((cat: string) => !categoryOrder.includes(cat))
      .sort()
    
    // Build categories list: always include "All" first, then ordered categories
    return ["All", ...orderedCategories, ...remainingCategories]
  }, [regularModules])

  // Memoize filtered modules (only regular modules, academy is separate)
  const filteredModules = useMemo(() => 
    regularModules.filter((module) => {
      // Apply category filter
      const matchesCategory = selectedCategory === "All" || module.category === selectedCategory
      if (!matchesCategory) return false
      
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        module.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        module.resources.some((resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      return matchesSearch
    }),
    [regularModules, selectedCategory, searchQuery]
  )

  // Generate search suggestions from module titles and resource titles (regular modules only)
  const searchSuggestions = useMemo(() => {
    const suggestions: string[] = []
    regularModules.forEach((module) => {
      suggestions.push(module.title)
      module.resources.forEach((resource) => {
        suggestions.push(resource.title)
      })
    })
    return suggestions
  }, [regularModules])

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  return (
    <div>
      {/* Title and Description */}
      <div className="text-center py-4 sm:py-8 mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-3 sm:mb-4">
          Training
        </h2>
        <p className="text-optavia-gray text-base sm:text-lg max-w-2xl mx-auto px-4">
          Access training modules, guides, and tools to support your coaching journey and help your clients succeed.
        </p>
      </div>

      {/* Coaching Amplifier Academy - Prominent Section */}
      {academyModules.length > 0 && (
        <div className="mb-8 sm:mb-12">
          <Card className="bg-gradient-to-br from-[hsl(var(--optavia-green))] to-[hsl(var(--optavia-green-dark))] border-0 shadow-xl">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-white/20 rounded-lg">
                  <GraduationCap className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-white text-2xl sm:text-3xl font-bold">
                    Coaching Amplifier Academy
                  </CardTitle>
                  <CardDescription className="text-white/90 text-base sm:text-lg mt-1">
                    Structured training courses to elevate your coaching career
                  </CardDescription>
                </div>
              </div>
              
              {/* Progress Indicator */}
              <div className="mt-4 bg-white/20 rounded-lg p-3 sm:p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-semibold text-sm sm:text-base">
                    Academy Progress
                  </span>
                  <span className="text-white font-bold text-sm sm:text-base">
                    {academyProgress.completed} / {academyProgress.total} Modules
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3">
                  <div
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${academyProgress.percentage}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {academyModules
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((module) => {
                    const locked = isModuleLocked(module)
                    // Extract module number: "academy-module-1" -> "1" or "module-1" -> "1"
                    const moduleMatch = module.id.match(/module-(\d+)/)
                    const moduleNumber = moduleMatch ? moduleMatch[1] : module.id.replace('academy-module-', '')
                    const isCompleted = userData.completedResources.includes(`academy-resource-${moduleNumber}`)
                    
                    return (
                      <Link
                        key={module.id}
                        href={locked ? "#" : `/academy/module-${moduleNumber}`}
                        onClick={(e) => locked && e.preventDefault()}
                        className={`block rounded-xl p-4 sm:p-5 transition-all ${
                          locked
                            ? "bg-white/10 cursor-not-allowed opacity-60"
                            : "bg-white hover:shadow-lg hover:scale-105"
                        }`}
                      >
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-lg flex-shrink-0 ${
                            locked ? "bg-white/20" : "bg-[hsl(var(--optavia-green-light))]"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className={`h-5 w-5 sm:h-6 sm:w-6 ${
                                locked ? "text-white/60" : "text-[hsl(var(--optavia-green))]"
                              }`} />
                            ) : (
                              <span className={`text-lg sm:text-xl ${
                                locked ? "text-white/60" : "text-[hsl(var(--optavia-green))]"
                              }`}>
                                {module.icon || "🎓"}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className={`font-bold text-sm sm:text-base ${
                                locked ? "text-white/80" : "text-optavia-dark"
                              }`}>
                                {module.title}
                              </h3>
                              {isCompleted && !locked && (
                                <CheckCircle2 className="h-4 w-4 text-[hsl(var(--optavia-green))] flex-shrink-0" />
                              )}
                              {locked && (
                                <Lock className="h-4 w-4 text-white/60 flex-shrink-0" />
                              )}
                            </div>
                            <p className={`text-xs sm:text-sm line-clamp-2 ${
                              locked ? "text-white/70" : "text-optavia-gray"
                            }`}>
                              {module.description}
                            </p>
                            {module.required_rank && (
                              <Badge
                                variant="outline"
                                className={`mt-2 text-xs ${
                                  locked
                                    ? "border-white/30 text-white/70"
                                    : "border-[hsl(var(--optavia-green))] text-[hsl(var(--optavia-green))]"
                                }`}
                              >
                                Requires {module.required_rank}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {!locked && (
                          <div className="flex items-center text-[hsl(var(--optavia-green))] text-sm font-semibold mt-2">
                            {isCompleted ? "Review Module" : "Start Module"}
                            <ArrowRight className="h-4 w-4 ml-1" />
                          </div>
                        )}
                        {locked && (
                          <div className="flex items-center text-white/70 text-xs sm:text-sm mt-2">
                            Locked
                          </div>
                        )}
                      </Link>
                    )
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Training Documents Section */}
      <div className="mb-6">
        <h3 className="font-heading font-bold text-xl sm:text-2xl text-optavia-dark mb-2">
          Training Documents & Resources
        </h3>
        <p className="text-optavia-gray text-sm sm:text-base mb-4">
          Browse training materials, guides, and resources
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="max-w-md">
          <SearchWithHistory
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search modules or resources..."
            suggestions={searchSuggestions}
            storageKey="training"
          />
        </div>

        {/* Category Filter - Mobile Dropdown */}
        <div className="md:hidden">
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
        <div className="hidden md:flex flex-wrap gap-2">
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
      </div>

      {/* Module Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => {
          const locked = isModuleLocked(module)
          return (
            <ModuleCard 
              key={module.id} 
              module={module} 
              userData={userData} 
              onClick={() => !locked && onSelectModule(module)}
              isLocked={locked}
              requiredRank={module.required_rank || null}
            />
          )
        })}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12 text-optavia-gray">No modules found matching your criteria.</div>
      )}
    </div>
  )
})
