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
      <div className="text-center py-4 sm:py-8 mb-4 sm:mb-6">
        <h2 className="font-heading font-bold text-xl sm:text-3xl text-optavia-dark mb-2 sm:mb-4">
          Training Resources
        </h2>
        <p className="text-optavia-gray text-sm sm:text-lg max-w-2xl mx-auto px-2">
          Browse training materials, guides, and resources.
        </p>
      </div>

      {/* Search and Filter */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search resources..."
              className="pl-10 h-11"
            />
          </div>

          {/* Category Filter - Mobile Dropdown */}
          <div className="sm:hidden">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full h-11">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">📚 All Categories</SelectItem>
                {uniqueCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    <span className="flex items-center gap-2">
                      <span>{getCategoryIcon(cat)}</span>
                      <span className="truncate">{cat.length > 30 ? cat.slice(0, 30) + "..." : cat}</span>
                    </span>
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
        <p className="text-sm text-optavia-gray mb-3 sm:mb-4 px-1">
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
        <div className="space-y-6 sm:space-y-8">
          {Object.entries(groupedFiltered).map(([category, catResources]) => (
            <div key={category}>
              {/* Category Header */}
              <div className="flex items-center gap-2 mb-3 sm:mb-4 px-1">
                <span className="text-xl sm:text-2xl">{getCategoryIcon(category)}</span>
                <h3 className="font-heading font-bold text-base sm:text-xl text-optavia-dark line-clamp-1 flex-1">
                  {category}
                </h3>
                <Badge variant="secondary" className="flex-shrink-0">
                  {catResources.length}
                </Badge>
              </div>

              {/* Resources List */}
              <div className="grid gap-2 sm:gap-3">
                {catResources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block active:scale-[0.99] transition-transform"
                  >
                    <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-[hsl(var(--optavia-green))]">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start gap-3">
                          {/* Type Icon */}
                          <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                            {getTypeIcon(resource.type)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-sm sm:text-base text-optavia-dark leading-tight">
                                  {resource.title}
                                </h4>
                                {/* Type badge - only on larger screens */}
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge
                                    variant="outline"
                                    className="text-xs capitalize"
                                  >
                                    {resource.type}
                                  </Badge>
                                </div>
                              </div>
                              {/* Open Icon */}
                              <div className="flex-shrink-0 p-1">
                                <ExternalLink className="h-4 w-4 sm:h-5 sm:w-5 text-[hsl(var(--optavia-green))]" />
                              </div>
                            </div>
                            {resource.description && (
                              <p className="text-xs sm:text-sm text-optavia-gray line-clamp-2 mt-1.5">
                                {resource.description}
                              </p>
                            )}
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
