"use client"

import { useState, useMemo } from "react"
import { useTrainingResources, typeIcons } from "@/hooks/use-training-resources"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ExternalLink, FileText, Video, Palette, Link2 } from "lucide-react"

export function TrainingResourcesTab() {
  const {
    resources,
    uniqueCategories,
    loading,
    filterResources,
    getCategoryIcon,
  } = useTrainingResources()

  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Filter resources based on category and search
  const filteredResources = useMemo(() => {
    return filterResources(selectedCategory, searchQuery)
  }, [filterResources, selectedCategory, searchQuery])

  // Group filtered resources by category for display
  const groupedFiltered = useMemo(() => {
    const grouped: Record<string, typeof resources> = {}
    filteredResources.forEach(r => {
      if (!grouped[r.category]) grouped[r.category] = []
      grouped[r.category].push(r)
    })
    return grouped
  }, [filteredResources])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="h-4 w-4 text-red-500" />
      case "canva":
        return <Palette className="h-4 w-4 text-purple-500" />
      case "document":
        return <FileText className="h-4 w-4 text-blue-500" />
      default:
        return <Link2 className="h-4 w-4 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--optavia-green))]"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Title and Description */}
      <div className="text-center py-4 sm:py-8 mb-6">
        <h2 className="font-heading font-bold text-2xl sm:text-3xl text-optavia-dark mb-3 sm:mb-4">
          Training Resources
        </h2>
        <p className="text-optavia-gray text-base sm:text-lg max-w-2xl mx-auto px-4">
          Browse training materials, guides, and resources to support your coaching journey.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="pl-10"
            />
          </div>

          {/* Category Filter - Mobile Dropdown */}
          <div className="sm:hidden">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {getCategoryIcon(cat)} {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Category Filter - Desktop Buttons */}
        <div className="hidden sm:flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("All")}
            className={
              selectedCategory === "All"
                ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                : "border-gray-300 text-optavia-dark hover:bg-gray-100"
            }
          >
            All
          </Button>
          {uniqueCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={
                selectedCategory === cat
                  ? "bg-[hsl(var(--optavia-green))] hover:bg-[hsl(var(--optavia-green-dark))] text-white"
                  : "border-gray-300 text-optavia-dark hover:bg-gray-100"
              }
            >
              {getCategoryIcon(cat)} {cat.length > 25 ? cat.slice(0, 25) + "..." : cat}
            </Button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {searchQuery && (
        <p className="text-sm text-optavia-gray mb-4">
          Found {filteredResources.length} result{filteredResources.length !== 1 ? "s" : ""} for "{searchQuery}"
        </p>
      )}

      {/* Resources grouped by category */}
      {Object.entries(groupedFiltered).length === 0 ? (
        <div className="text-center py-12 text-optavia-gray">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
          <p>No resources found matching your criteria.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedFiltered).map(([category, catResources]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{getCategoryIcon(category)}</span>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-optavia-dark">
                  {category}
                </h3>
                <Badge variant="secondary" className="ml-2">
                  {catResources.length}
                </Badge>
              </div>

              {/* Resources List */}
              <div className="grid gap-3">
                {catResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-[hsl(var(--optavia-green))]">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Type Icon */}
                          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            {getTypeIcon(resource.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-optavia-dark truncate">
                                {resource.title}
                              </h4>
                              <Badge
                                variant="outline"
                                className="flex-shrink-0 text-xs capitalize"
                              >
                                {resource.type}
                              </Badge>
                            </div>
                            {resource.description && (
                              <p className="text-sm text-optavia-gray line-clamp-2">
                                {resource.description}
                              </p>
                            )}
                          </div>

                          {/* Open Icon */}
                          <div className="flex-shrink-0">
                            <ExternalLink className="h-5 w-5 text-[hsl(var(--optavia-green))]" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
