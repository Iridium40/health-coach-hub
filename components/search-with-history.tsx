"use client"

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react"
import { Input } from "@/components/ui/input"
import { Search, Clock, X, TrendingUp } from "lucide-react"

interface SearchSuggestion {
  text: string
  type: "history" | "suggestion"
}

interface SearchWithHistoryProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  suggestions?: string[]
  storageKey: string
  maxHistory?: number
}

export const SearchWithHistory = memo(function SearchWithHistory({
  value,
  onChange,
  placeholder = "Search...",
  suggestions = [],
  storageKey,
  maxHistory = 5,
}: SearchWithHistoryProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [history, setHistory] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`search-history-${storageKey}`)
      if (stored) {
        setHistory(JSON.parse(stored))
      }
    } catch (e) {
      console.error("Error loading search history:", e)
    }
  }, [storageKey])

  // Save history to localStorage
  const saveHistory = useCallback((newHistory: string[]) => {
    try {
      localStorage.setItem(`search-history-${storageKey}`, JSON.stringify(newHistory))
      setHistory(newHistory)
    } catch (e) {
      console.error("Error saving search history:", e)
    }
  }, [storageKey])

  // Add search term to history
  const addToHistory = useCallback((term: string) => {
    if (!term.trim()) return
    const trimmed = term.trim().toLowerCase()
    const newHistory = [
      trimmed,
      ...history.filter((h) => h.toLowerCase() !== trimmed),
    ].slice(0, maxHistory)
    saveHistory(newHistory)
  }, [history, maxHistory, saveHistory])

  // Remove item from history
  const removeFromHistory = useCallback((term: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newHistory = history.filter((h) => h !== term)
    saveHistory(newHistory)
  }, [history, saveHistory])

  // Clear all history
  const clearHistory = useCallback(() => {
    saveHistory([])
  }, [saveHistory])

  // Filter suggestions based on current input
  const filteredSuggestions = useMemo(() => {
    if (!value.trim()) return []
    const searchLower = value.toLowerCase()
    return suggestions
      .filter((s) => s.toLowerCase().includes(searchLower) && s.toLowerCase() !== searchLower)
      .slice(0, 5)
  }, [value, suggestions])

  // Combine history and suggestions for dropdown
  const dropdownItems = useMemo((): SearchSuggestion[] => {
    const items: SearchSuggestion[] = []
    
    // If no input, show history
    if (!value.trim()) {
      history.forEach((h) => {
        items.push({ text: h, type: "history" })
      })
    } else {
      // Show matching history first
      const searchLower = value.toLowerCase()
      history
        .filter((h) => h.toLowerCase().includes(searchLower))
        .forEach((h) => {
          items.push({ text: h, type: "history" })
        })
      
      // Then show suggestions
      filteredSuggestions.forEach((s) => {
        if (!items.find((i) => i.text.toLowerCase() === s.toLowerCase())) {
          items.push({ text: s, type: "suggestion" })
        }
      })
    }
    
    return items.slice(0, 8)
  }, [value, history, filteredSuggestions])

  // Handle input change
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
    setSelectedIndex(-1)
  }, [onChange])

  // Handle selecting an item
  const handleSelect = useCallback((text: string) => {
    onChange(text)
    addToHistory(text)
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }, [onChange, addToHistory])

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen && e.key === "ArrowDown") {
      setIsOpen(true)
      return
    }

    if (!isOpen) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) => 
          prev < dropdownItems.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0 && dropdownItems[selectedIndex]) {
          handleSelect(dropdownItems[selectedIndex].text)
        } else if (value.trim()) {
          addToHistory(value)
          setIsOpen(false)
        }
        break
      case "Escape":
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }, [isOpen, dropdownItems, selectedIndex, value, handleSelect, addToHistory])

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsOpen(true)
  }, [])

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const showDropdown = isOpen && (dropdownItems.length > 0 || (history.length > 0 && !value.trim()))

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-optavia-light-gray pointer-events-none z-10" />
      <Input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        className="pl-10 pr-4"
        autoComplete="off"
      />
      
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
        >
          {/* History header when showing history */}
          {!value.trim() && history.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-100">
              <span className="text-xs font-medium text-optavia-gray">Recent Searches</span>
              <button
                onClick={clearHistory}
                className="text-xs text-optavia-light-gray hover:text-optavia-gray transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
          
          {/* Dropdown items */}
          <ul className="max-h-64 overflow-y-auto">
            {dropdownItems.map((item, index) => (
              <li key={`${item.type}-${item.text}`}>
                <button
                  onClick={() => handleSelect(item.text)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                    index === selectedIndex
                      ? "bg-[hsl(var(--optavia-green-light))]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {item.type === "history" ? (
                    <Clock className="h-4 w-4 text-optavia-light-gray flex-shrink-0" />
                  ) : (
                    <TrendingUp className="h-4 w-4 text-[hsl(var(--optavia-green))] flex-shrink-0" />
                  )}
                  <span className="flex-1 text-sm text-optavia-dark truncate">
                    {item.text}
                  </span>
                  {item.type === "history" && (
                    <button
                      onClick={(e) => removeFromHistory(item.text, e)}
                      className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                      aria-label="Remove from history"
                    >
                      <X className="h-3 w-3 text-optavia-light-gray" />
                    </button>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
})

