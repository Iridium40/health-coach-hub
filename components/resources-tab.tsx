"use client"

import { useState } from "react"
import { ModuleCard } from "@/components/module-card"
import { modules } from "@/lib/data"
import type { UserData, Module } from "@/lib/types"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface ResourcesTabProps {
  userData: UserData
  setUserData: (data: UserData) => void
  onSelectModule: (module: Module) => void
}

export function ResourcesTab({ userData, setUserData, onSelectModule }: ResourcesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  // Get all available modules for this user
  const availableModules = modules.filter((module) => {
    if (userData.isNewCoach && !module.forNewCoach) return false
    return true
  })

  // Get unique categories from available modules
  const availableCategories = Array.from(
    new Set(availableModules.map((module) => module.category))
  )

  // Define the desired order for categories
  const categoryOrder = ["Getting Started", "Business Building", "Client Support", "Training"]
  
  // Sort categories according to the desired order, then add any remaining categories
  const orderedCategories = categoryOrder.filter(cat => availableCategories.includes(cat))
  const remainingCategories = availableCategories
    .filter(cat => !categoryOrder.includes(cat))
    .sort()
  
  // Build categories list: always include "All" first, then ordered categories
  const categories = ["All", ...orderedCategories, ...remainingCategories]

  const filteredModules = availableModules.filter((module) => {
    if (selectedCategory === "All") return true
    return module.category === selectedCategory
  })

  return (
    <div>
      {/* Title and Description */}
      <div className="text-center py-4 sm:py-8 mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-3 sm:mb-4">
          Resources
        </h2>
        <p className="text-optavia-gray text-base sm:text-lg max-w-2xl mx-auto px-4">
          Access training modules, guides, and tools to support your coaching journey and help your clients succeed.
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

      {/* Module Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredModules.map((module) => (
          <ModuleCard key={module.id} module={module} userData={userData} onClick={() => onSelectModule(module)} />
        ))}
      </div>

      {filteredModules.length === 0 && (
        <div className="text-center py-12 text-optavia-gray">No modules found in this category.</div>
      )}
    </div>
  )
}
