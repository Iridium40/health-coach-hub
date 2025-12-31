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

interface TrainingTabProps {
  userData: UserData
  setUserData: (data: UserData) => void
  onSelectModule: (module: Module) => void
  modules: Module[]
}

export const TrainingTab = memo(function TrainingTab({ userData, setUserData, onSelectModule, modules }: TrainingTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Memoize available modules for this user
  const availableModules = useMemo(() => 
    modules.filter((module) => {
      if (userData.isNewCoach && !module.forNewCoach) return false
      return true
    }),
    [modules, userData.isNewCoach]
  )

  // Memoize categories list
  const categories = useMemo(() => {
    // Get unique categories from available modules
    const availableCategories: string[] = Array.from(
      new Set(availableModules.map((module) => module.category))
    )

    // Define the desired order for categories
    const categoryOrder: string[] = ["Getting Started", "Client Support", "Business Building"]
    
    // Sort categories according to the desired order, then add any remaining categories
    const orderedCategories = categoryOrder.filter((cat: string) => availableCategories.includes(cat))
    const remainingCategories = availableCategories
      .filter((cat: string) => !categoryOrder.includes(cat))
      .sort()
    
    // Build categories list: always include "All" first, then ordered categories
    return ["All", ...orderedCategories, ...remainingCategories]
  }, [availableModules])

  // Memoize filtered modules
  const filteredModules = useMemo(() => 
    availableModules.filter((module) => {
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
    [availableModules, selectedCategory, searchQuery]
  )

  // Generate search suggestions from module titles and resource titles
  const searchSuggestions = useMemo(() => {
    const suggestions: string[] = []
    availableModules.forEach((module) => {
      suggestions.push(module.title)
      module.resources.forEach((resource) => {
        suggestions.push(resource.title)
      })
    })
    return suggestions
  }, [availableModules])

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
        {filteredModules.map((module) => (
          <ModuleCard key={module.id} module={module} userData={userData} onClick={() => onSelectModule(module)} />
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12 text-optavia-gray">No modules found matching your criteria.</div>
      )}
    </div>
  )
})
