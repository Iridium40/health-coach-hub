"use client"

import { useState } from "react"
import { ModuleCard } from "@/components/module-card"
import { modules } from "@/lib/data"
import type { UserData, Module } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface ResourcesTabProps {
  userData: UserData
  setUserData: (data: UserData) => void
  onSelectModule: (module: Module) => void
}

export function ResourcesTab({ userData, setUserData, onSelectModule }: ResourcesTabProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("All")

  const filteredModules = modules.filter((module) => {
    if (userData.isNewCoach && !module.forNewCoach) return false
    if (selectedCategory === "All") return true
    return module.category === selectedCategory
  })

  const categories = ["All", "Getting Started", "Client Support", "Business Building", "Training"]

  return (
    <div>
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto scrollbar-hide -mx-4 px-4">
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
