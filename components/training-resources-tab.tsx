"use client"

import { useState, useMemo, useCallback } from "react"
import { useTrainingResources, typeIcons } from "@/hooks/use-training-resources"
import { useUserData } from "@/contexts/user-data-context"
import { SearchWithHistory } from "@/components/search-with-history"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, ExternalLink, FileText, Video, Palette, Link2, ChevronDown, ChevronRight, CheckCircle, Circle } from "lucide-react"

export function TrainingResourcesTab() {
  const { user, profile } = useUserData()
  const userRank = profile?.coach_rank || null
  
  const {
    resources,
    uniqueCategories,
    loading,
    filterResources,
    getCategoryIcon,
    isCompleted,
    toggleCompletion,
    progress,
    getCategoryProgress,
  } = useTrainingResources(user, userRank)

  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Generate search suggestions from resource titles and categories
  const searchSuggestions = useMemo(() => {
    const suggestions: string[] = []
    resources.forEach((resource) => {
      suggestions.push(resource.title)
      if (resource.category && !suggestions.includes(resource.category)) {
        suggestions.push(resource.category)
      }
    })
    return suggestions
  }, [resources])

  // Handle search change
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value)
  }, [])

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  // Expand all categories
  const expandAll = () => {
    setExpandedCategories(new Set(uniqueCategories))
  }

  // Collapse all categories
  const collapseAll = () => {
    setExpandedCategories(new Set())
  }

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
      {/* Title and Description with Progress */}
      <div className="text-center py-4 sm:py-6 mb-4 sm:mb-6">
        <h2 className="font-heading font-bold text-xl sm:text-3xl text-optavia-dark mb-2">
          Training Resources
        </h2>
        {user && (
          <div className="max-w-md mx-auto mt-3 px-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-optavia-gray">Your Progress</span>
              <span className="font-semibold text-[hsl(var(--optavia-green))]">
                {progress.completed} / {progress.total} ({progress.percentage}%)
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>
        )}
      </div>

      {/* Search and Filter */}
      <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
        <div className="flex flex-col gap-3">
          {/* Search with autocomplete suggestions */}
          <div className="w-full sm:max-w-md">
            <SearchWithHistory
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search resources..."
              suggestions={searchSuggestions}
              storageKey="training-resources"
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
        <div className="space-y-3 sm:space-y-4">
          {/* Expand/Collapse All buttons */}
          <div className="flex justify-end gap-2 px-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={expandAll}
              className="text-xs text-optavia-gray hover:text-optavia-dark"
            >
              Expand All
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={collapseAll}
              className="text-xs text-optavia-gray hover:text-optavia-dark"
            >
              Collapse All
            </Button>
          </div>

          {Object.entries(groupedFiltered).map(([category, catResources]) => {
            const isExpanded = expandedCategories.has(category)
            const catProgress = getCategoryProgress(category)
            const isComplete = catProgress.completed === catProgress.total && catProgress.total > 0
            
            return (
              <div key={category} className="border rounded-lg overflow-hidden bg-white">
                {/* Category Header - Clickable */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center gap-2 p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  {/* Expand/Collapse Icon */}
                  <div className="flex-shrink-0 text-gray-400">
                    {isExpanded ? (
                      <ChevronDown className="h-5 w-5" />
                    ) : (
                      <ChevronRight className="h-5 w-5" />
                    )}
                  </div>
                  
                  <span className="text-lg sm:text-xl">{getCategoryIcon(category)}</span>
                  <h3 className="font-heading font-bold text-sm sm:text-base text-optavia-dark line-clamp-1 flex-1">
                    {category}
                  </h3>
                  
                  {/* Category Progress */}
                  {user && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isComplete ? (
                        <Badge className="bg-green-100 text-green-700 text-xs">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          {catProgress.completed}/{catProgress.total}
                        </Badge>
                      )}
                    </div>
                  )}
                  {!user && (
                    <Badge variant="secondary" className="flex-shrink-0 text-xs">
                      {catResources.length}
                    </Badge>
                  )}
                </button>

                {/* Resources List - Collapsible */}
                {isExpanded && (
                  <div className="border-t bg-gray-50/50 divide-y divide-gray-100">
                    {catResources.map((resource) => {
                      const completed = isCompleted(resource.id)
                      return (
                        <div
                          key={resource.id}
                          className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-100 transition-colors group ${
                            completed ? "bg-green-50/50" : ""
                          }`}
                        >
                          {/* Checkbox */}
                          {user && (
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                toggleCompletion(resource.id)
                              }}
                              className="flex-shrink-0 p-0.5"
                              title={completed ? "Mark as incomplete" : "Mark as complete"}
                            >
                              {completed ? (
                                <CheckCircle className="h-5 w-5 text-green-600" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-300 hover:text-gray-400" />
                              )}
                            </button>
                          )}

                          {/* Type Icon */}
                          <div className="flex-shrink-0 w-6 h-6 rounded bg-white border border-gray-200 flex items-center justify-center">
                            {getTypeIcon(resource.type)}
                          </div>

                          {/* Content - Clickable Link */}
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-w-0 flex items-center gap-2"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm leading-snug group-hover:text-[hsl(var(--optavia-green))] transition-colors truncate ${
                                completed ? "text-gray-500" : "text-optavia-dark"
                              }`}>
                                {resource.title}
                              </h4>
                            </div>

                            {/* Type badge + Open Icon */}
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Badge variant="outline" className="text-[10px] capitalize hidden sm:inline-flex">
                                {resource.type}
                              </Badge>
                              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-[hsl(var(--optavia-green))] transition-colors" />
                            </div>
                          </a>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
