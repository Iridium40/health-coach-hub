"use client"

import React, { useState } from 'react'
import { Input } from "@/components/ui/input"
import { Search, X } from "lucide-react"

// ============================================================================
// CONFIGURATION DATA
// ============================================================================

const TABS = [
  { id: 'fats', label: 'Healthy Fats', icon: '🥑' },
  { id: 'dressings', label: 'Salad Dressings', icon: '🥗' },
  { id: 'condiments', label: 'Condiments', icon: '🧂' },
]

// ============ HEALTHY FATS DATA ============
const healthyFats = {
  monounsaturated: {
    title: "Monounsaturated Fats",
    color: "emerald",
    description: "Heart-healthy fats — choose most servings from this category",
    categories: [
      {
        name: "Basics",
        items: [
          { name: "Avocado", amount: "1½ oz" },
          { name: "Guacamole", amount: "2 Tbsp" },
          { name: "Olives (black or green)", amount: "5–10" },
          { name: "Almond flour", amount: "1½ Tbsp" },
          { name: "Pesto", amount: "1 Tbsp" },
        ]
      },
      {
        name: "Oils (1 tsp each)",
        items: [
          { name: "Avocado Oil", amount: "1 tsp" },
          { name: "Canola Oil", amount: "1 tsp" },
          { name: "Olive Oil", amount: "1 tsp" },
          { name: "Peanut Oil", amount: "1 tsp" },
        ]
      },
      {
        name: "Nuts (⅓ oz each)",
        items: [
          { name: "Almonds", amount: "~8 pieces" },
          { name: "Brazil nuts", amount: "~2 pieces" },
          { name: "Cashews", amount: "~6 pieces" },
          { name: "Hazelnuts", amount: "~6 pieces" },
          { name: "Macadamia", amount: "~3 pieces" },
          { name: "Peanuts", amount: "~12 pieces" },
          { name: "Pecans", amount: "~5 halves" },
          { name: "Pistachios", amount: "~18 pieces" },
        ]
      },
      {
        name: "Seeds & Milks",
        items: [
          { name: "Sesame Seeds", amount: "1 Tbsp" },
          { name: "Almond Milk (unsweetened)", amount: "2 cups" },
          { name: "Cashew Milk (unsweetened)", amount: "2 cups" },
        ]
      },
    ]
  },
  polyunsaturated: {
    title: "Polyunsaturated Fats",
    color: "blue",
    description: "Essential fatty acids your body can't produce",
    categories: [
      {
        name: "Spreads",
        items: [
          { name: "Margarine (regular)", amount: "½ Tbsp" },
          { name: "Margarine (reduced-fat)", amount: "1 Tbsp" },
          { name: "Mayonnaise (regular)", amount: "½ Tbsp" },
          { name: "Mayonnaise (light)", amount: "1½ Tbsp" },
          { name: "Mayonnaise (reduced-fat w/ olive oil)", amount: "1 Tbsp" },
        ]
      },
      {
        name: "Oils (1 tsp each)",
        items: [
          { name: "Flaxseed Oil", amount: "1 tsp" },
          { name: "Grapeseed Oil", amount: "1 tsp" },
          { name: "Safflower Oil", amount: "1 tsp" },
          { name: "Sesame Oil", amount: "1 tsp" },
          { name: "Soybean Oil", amount: "1 tsp" },
        ]
      },
      {
        name: "Nuts (⅓ oz each)",
        items: [
          { name: "Pine nuts", amount: "~55 kernels" },
          { name: "Walnuts", amount: "~4 halves" },
        ]
      },
      {
        name: "Seeds (1 Tbsp each unless noted)",
        items: [
          { name: "Chia Seeds", amount: "1 Tbsp" },
          { name: "Flax Seeds (ground)", amount: "2 Tbsp" },
          { name: "Flax Seeds (whole)", amount: "1 Tbsp" },
          { name: "Hemp Seeds", amount: "1 Tbsp" },
          { name: "Poppy Seeds", amount: "1 Tbsp" },
          { name: "Pumpkin Seeds", amount: "1 Tbsp" },
          { name: "Sunflower Seeds", amount: "1 Tbsp" },
        ]
      },
    ]
  },
  saturated: {
    title: "Saturated Fats",
    color: "amber",
    description: "Use sparingly — limit to occasional servings",
    categories: [
      {
        name: "Dairy & Spreads",
        items: [
          { name: "Butter", amount: "½ Tbsp" },
          { name: "Cream (half & half)", amount: "3 Tbsp" },
          { name: "Cream cheese (regular)", amount: "1 Tbsp" },
          { name: "Cream cheese (low-fat)", amount: "2 Tbsp" },
          { name: "Sour cream", amount: "2 Tbsp" },
          { name: "Laughing Cow cheese wedge", amount: "1 wedge" },
        ]
      },
      {
        name: "Coconut Products",
        items: [
          { name: "Coconut (shredded, unsweetened)", amount: "1½ Tbsp" },
          { name: "Coconut milk (canned, regular)", amount: "2 Tbsp" },
          { name: "Coconut milk (canned, light)", amount: "¼ cup" },
          { name: "Coconut milk (refrigerated, unsweetened)", amount: "1 cup" },
        ]
      },
    ]
  },
}

// ============ SALAD DRESSINGS DATA ============
const saladDressings = [
  {
    brand: "Annie's Naturals",
    color: "orange",
    dressings: [
      { serving: "1 Tbsp", items: ["Goddess", "Organic Cowgirl Ranch", "Organic Roasted Garlic Vinaigrette", "Organic Green Goddess", "Organic Goddess", "Organic French", "Organic Caesar", "Organic Balsamic", "Organic Asian Sesame", "Cowgirl Ranch", "Balsamic Vinaigrette"] },
      { serving: "2 Tbsp", items: ["Woodstock Lemon & Chive Vinaigrette", "Tuscany Italian", "Artichoke Parmesan", "Organic Smoky Tomato", "Roasted Red Pepper", "Lite Goddess"] },
    ]
  },
  {
    brand: "Hidden Valley",
    color: "green",
    dressings: [
      { serving: "1 Tbsp", items: ["Avocado Ranch", "Cucumber Ranch", "Sweet Chili Ranch", "Roasted Garlic Ranch", "Fiesta Salsa Ranch", "Cracked Peppercorn Ranch", "Simply Ranch Cucumber Basil", "Simply Ranch Classic Ranch", "Simply Ranch Chili Lime"] },
      { serving: "2 Tbsp", items: ["Buttermilk Ranch Light", "Cucumber Ranch Light", "Fiesta Salsa Ranch Light", "Original Ranch Homestyle Light", "Greek Yogurt Spinach & Feta", "Greek Yogurt Lemon Garlic", "Greek Yogurt Ranch", "Greek Yogurt Cucumber Dill"] },
    ]
  },
  {
    brand: "Ken's",
    color: "red",
    dressings: [
      { serving: "1 Tbsp", items: ["Light Options Balsamic Vinaigrette", "Buttermilk Ranch", "Red Wine Vinaigrette", "Peppercorn Ranch", "Classic Ranch", "Classic Caesar", "Roka Blue Cheese", "Ranch with Bacon", "Cucumber Ranch", "Thousand Island"] },
      { serving: "2 Tbsp", items: ["Balsamic Vinaigrette", "Creamy French", "Greek", "Honey Mustard", "Italian", "Red Wine Vinegar & Olive Oil", "Three Cheese Italian", "Chef's Reserve French", "Chef's Reserve Italian"] },
    ]
  },
  {
    brand: "Kraft",
    color: "blue",
    dressings: [
      { serving: "1 Tbsp", items: ["Sun Dried Tomato", "Tuscan House Italian", "Greek Vinaigrette", "Zesty Lime Vinaigrette", "Caesar Vinaigrette", "Zesty Italian"] },
      { serving: "2 Tbsp", items: ["Balsamic Vinaigrette", "Greek Vinaigrette", "Honey French", "Parmesan & Roasted Garlic", "Three Cheese Balsamic Vinaigrette"] },
    ]
  },
  {
    brand: "Newman's Own",
    color: "yellow",
    dressings: [
      { serving: "1 Tbsp", items: ["Lime Lite Vinaigrette", "Lite Caesar", "Lite Italian", "Lite Red Wine Vinegar & Olive Oil"] },
      { serving: "2 Tbsp", items: [] },
    ]
  },
  {
    brand: "Wishbone",
    color: "purple",
    dressings: [
      { serving: "1 Tbsp", items: ["House Italian", "Creamy Italian", "Spicy Caesar", "South of the Border Ranch", "Thousand Island", "Sweet & Spicy Honey Mustard", "Sweet & Spicy French", "Deluxe French", "Creamy Italian"] },
      { serving: "2 Tbsp", items: ["Mediterranean Italian", "Bruschetta Italian", "Balsamic Italian Vinaigrette", "Romano Basil Vinaigrette", "Olive Oil Vinaigrette", "Greek Vinaigrette", "Balsamic Vinaigrette", "Light Thousand Island", "Light Ranch", "Light Parmesan Peppercorn Ranch", "Light Creamy Caesar", "Light Buffalo Ranch", "Light Blue Cheese"] },
    ]
  },
]

// ============ CONDIMENTS DATA ============
const condimentSections = [
  {
    title: "Fresh Herbs",
    icon: "🌿",
    items: [
      { name: "Basil (whole leaves)", amount: "1 cup" },
      { name: "Basil (chopped)", amount: "½ cup" },
      { name: "Cilantro", amount: "1 cup" },
      { name: "Dill weed", amount: "1 cup" },
      { name: "Parsley", amount: "¼ cup" },
      { name: "Chives (chopped)", amount: "¼ cup" },
      { name: "Peppermint", amount: "¼ cup" },
      { name: "Rosemary", amount: "2 Tbsp" },
      { name: "Sage", amount: "2 Tbsp" },
      { name: "Spearmint", amount: "2 Tbsp" },
      { name: "Thyme", amount: "1 Tbsp" },
      { name: "Garlic (minced)", amount: "1 tsp" },
      { name: "Garlic (whole)", amount: "1 clove" },
      { name: "Ginger root", amount: "2 tsp" },
      { name: "Lemongrass", amount: "2 tsp" },
      { name: "Capers", amount: "2 Tbsp" },
    ]
  },
  {
    title: "Sauces & Syrups",
    icon: "🍶",
    items: [
      { name: "Hot sauce", amount: "2 Tbsp" },
      { name: "Sugar-free BBQ sauce", amount: "1 Tbsp" },
      { name: "Reduced-sugar ketchup", amount: "1 Tbsp" },
      { name: "Salsa (tomato)", amount: "1 Tbsp" },
      { name: "Soy sauce", amount: "1 Tbsp" },
      { name: "Fish sauce", amount: "1 Tbsp" },
      { name: "Yellow mustard", amount: "1 Tbsp" },
      { name: "Dijon mustard", amount: "1 tsp" },
      { name: "Sriracha", amount: "1 tsp" },
      { name: "Horseradish", amount: "1 tsp" },
      { name: "Teriyaki sauce", amount: "1 tsp" },
      { name: "Steak sauce", amount: "1 tsp" },
      { name: "Oyster sauce", amount: "1 tsp" },
      { name: "Tomato paste", amount: "1 tsp" },
      { name: "Wasabi", amount: "½ tsp" },
      { name: "Worcestershire sauce", amount: "½ tsp" },
      { name: "Regular BBQ sauce", amount: "½ tsp" },
      { name: "Regular ketchup", amount: "½ tsp" },
      { name: "Cocktail sauce", amount: "½ tsp" },
      { name: "Honey mustard sauce", amount: "½ tsp" },
      { name: "Sweet and sour sauce", amount: "½ tsp" },
      { name: "Sugar-free syrups (Torani, Walden Farms)", amount: "2 Tbsp" },
    ]
  },
  {
    title: "Vinegars & Citrus",
    icon: "🍋",
    items: [
      { name: "Vinegar (cider, white, wine)", amount: "¼ cup" },
      { name: "Balsamic vinegar", amount: "1 tsp" },
      { name: "Lemon or lime juice", amount: "2 tsp" },
      { name: "Lemon or lime zest", amount: "1 Tbsp" },
    ]
  },
  {
    title: "Dairy, Cheese & Milks",
    icon: "🧀",
    items: [
      { name: "Greek yogurt (plain, nonfat/low-fat)", amount: "2 Tbsp" },
      { name: "Blue/feta/parmesan (reduced-fat)", amount: "2 Tbsp" },
      { name: "Blue/feta/parmesan (regular)", amount: "1 Tbsp" },
      { name: "Sour cream (regular or light)", amount: "1 Tbsp" },
      { name: "Light cream cheese", amount: "1 Tbsp" },
      { name: "Laughing Cow cheese wedge", amount: "1 wedge" },
      { name: "Regular cream cheese", amount: "½ Tbsp" },
      { name: "Butter Buds", amount: "½ tsp" },
      { name: "Whipped topping (Reddi-whip)", amount: "2 Tbsp" },
      { name: "Whipped topping (Cool Whip)", amount: "1 Tbsp" },
      { name: "Cream substitute (sugar-free)", amount: "1 tsp" },
      { name: "Cream substitute (regular)", amount: "½ tsp" },
      { name: "Almond milk (unsweetened)", amount: "1 cup" },
      { name: "Cashew milk (unsweetened)", amount: "1 cup" },
      { name: "Coconut milk (refrigerated, unsweetened)", amount: "½ cup" },
      { name: "Coconut milk (canned, light)", amount: "2 Tbsp" },
      { name: "Coconut milk (canned, regular)", amount: "1 Tbsp" },
      { name: "Soy milk (unsweetened)", amount: "2 Tbsp" },
      { name: "Cow's milk (unflavored)", amount: "1 Tbsp" },
      { name: "Rice milk (unsweetened)", amount: "1 Tbsp" },
    ]
  },
  {
    title: "Baking & Cooking",
    icon: "👨‍🍳",
    items: [
      { name: "Broth or stock", amount: "⅓–1 cup*" },
      { name: "Liquid egg substitute", amount: "3 Tbsp" },
      { name: "Almond flour", amount: "2 tsp" },
      { name: "Slivered almonds", amount: "2 tsp" },
      { name: "Coconut (shredded, unsweetened)", amount: "2 tsp" },
      { name: "Nutritional yeast (large flakes)", amount: "2 tsp" },
      { name: "Onion (chopped)", amount: "1 Tbsp" },
      { name: "Seaweed (dried)", amount: "1 Tbsp" },
      { name: "Seaweed (fresh)", amount: "2 Tbsp" },
      { name: "Cocoa powder (unsweetened)", amount: "1 tsp" },
      { name: "Nutritional yeast (small flakes)", amount: "1 tsp" },
      { name: "Extracts (vanilla, almond, etc.)", amount: "1 tsp" },
      { name: "Baking soda", amount: "1 tsp" },
      { name: "Bouillon cube", amount: "1 cube" },
      { name: "Cooking spray (Pam)", amount: "10 sprays" },
      { name: "Imitation butter spray", amount: "10 sprays" },
      { name: "Baking powder", amount: "½ tsp" },
      { name: "Baker's yeast", amount: "½ tsp" },
      { name: "Cream of tartar", amount: "½ tsp" },
      { name: "Cornmeal", amount: "½ tsp" },
      { name: "Wheat germ", amount: "½ tsp" },
      { name: "Bran (wheat, rice, corn)", amount: "½ tsp" },
      { name: "Ranch dressing mix", amount: "½ tsp" },
      { name: "Pine nuts", amount: "⅛ oz (~20)" },
    ]
  },
  {
    title: "Seeds (Condiment Portions)",
    icon: "🌰",
    items: [
      { name: "Sesame seeds", amount: "1 tsp" },
      { name: "Flax seeds (whole or ground)", amount: "1 tsp" },
      { name: "Hemp seeds", amount: "1 tsp" },
      { name: "Pumpkin seeds", amount: "1 tsp" },
      { name: "Sunflower seeds", amount: "1 tsp" },
      { name: "Poppy seeds", amount: "1 tsp" },
      { name: "Chia seeds", amount: "½ tsp" },
    ]
  },
  {
    title: "Sweeteners & Flavor Enhancers",
    icon: "✨",
    items: [
      { name: "Calorie-free sweetener", amount: "1 packet" },
      { name: "Monk Fruit In The Raw", amount: "1 packet" },
      { name: "Crystal Light \"On the Go\"", amount: "½ packet" },
      { name: "Liquid stevia", amount: "5 drops" },
      { name: "Mio", amount: "½ tsp" },
    ]
  },
]

const popularSpices = [
  { name: "Salt", amount: "¼ tsp" },
  { name: "Pepper", amount: "½ tsp" },
  { name: "Garlic powder", amount: "½ tsp" },
  { name: "Onion powder", amount: "½ tsp" },
  { name: "Paprika", amount: "½ tsp" },
  { name: "Cumin", amount: "1 tsp" },
  { name: "Chili powder", amount: "½ tsp" },
  { name: "Cayenne", amount: "½ tsp" },
  { name: "Oregano", amount: "½ tsp" },
  { name: "Basil (dried)", amount: "1 tsp" },
  { name: "Thyme", amount: "1 tsp" },
  { name: "Rosemary", amount: "1 tsp" },
  { name: "Cinnamon", amount: "½ tsp" },
  { name: "Ginger (ground)", amount: "½ tsp" },
  { name: "Curry powder", amount: "½ tsp" },
  { name: "Turmeric", amount: "½ tsp" },
  { name: "Poultry seasoning", amount: "1 tsp" },
  { name: "Italian seasoning", amount: "½ tsp" },
  { name: "Nutmeg", amount: "½ tsp" },
  { name: "Dill weed (dried)", amount: "1 tsp" },
]

const allDriedSpices = [
  { name: "Allspice", amount: "½ tsp" },
  { name: "Anise seed", amount: "½ tsp" },
  { name: "Basil (whole leaves)", amount: "2 tsp" },
  { name: "Basil (ground)", amount: "1 tsp" },
  { name: "Bay leaf", amount: "2 tsp" },
  { name: "Caraway seed", amount: "½ tsp" },
  { name: "Cardamom", amount: "½ tsp" },
  { name: "Cayenne pepper", amount: "½ tsp" },
  { name: "Celery seed", amount: "1 tsp" },
  { name: "Chili powder", amount: "½ tsp" },
  { name: "Cilantro (dried)", amount: "1 Tbsp" },
  { name: "Cinnamon", amount: "½ tsp" },
  { name: "Cloves (whole)", amount: "1 tsp" },
  { name: "Cloves (ground)", amount: "½ tsp" },
  { name: "Coriander seed", amount: "1 tsp" },
  { name: "Crushed red pepper", amount: "½ tsp" },
  { name: "Cumin seed (whole/ground)", amount: "1 tsp" },
  { name: "Curry powder", amount: "½ tsp" },
  { name: "Dill seed", amount: "½ tsp" },
  { name: "Dill weed", amount: "1 tsp" },
  { name: "Fennel seed", amount: "½ tsp" },
  { name: "Fenugreek seed", amount: "¼ tsp" },
  { name: "Garlic powder", amount: "½ tsp" },
  { name: "Ginger (ground)", amount: "½ tsp" },
  { name: "Mace", amount: "1 tsp" },
  { name: "Marjoram", amount: "2 tsp" },
  { name: "Mustard seed (ground)", amount: "1 tsp" },
  { name: "Nutmeg", amount: "½ tsp" },
  { name: "Onion powder", amount: "½ tsp" },
  { name: "Oregano (whole leaves)", amount: "1 tsp" },
  { name: "Oregano (ground)", amount: "½ tsp" },
  { name: "Paprika", amount: "½ tsp" },
  { name: "Parsley (dried)", amount: "1 Tbsp" },
  { name: "Pepper", amount: "½ tsp" },
  { name: "Poppy seed", amount: "1 tsp" },
  { name: "Poultry seasoning", amount: "1 tsp" },
  { name: "Pumpkin pie spice", amount: "½ tsp" },
  { name: "Rosemary", amount: "1 tsp" },
  { name: "Saffron", amount: "1 tsp" },
  { name: "Sage", amount: "2 tsp" },
  { name: "Salt", amount: "¼ tsp" },
  { name: "Savory", amount: "1 tsp" },
  { name: "Spearmint (dried)", amount: "1 Tbsp" },
  { name: "Spice mixes", amount: "½ tsp" },
  { name: "Tarragon (whole leaves)", amount: "1 Tbsp" },
  { name: "Tarragon (ground)", amount: "1 tsp" },
  { name: "Thyme (whole/ground)", amount: "1 tsp" },
  { name: "Turmeric", amount: "½ tsp" },
]

// ============================================================================
// TYPES
// ============================================================================

interface SearchItem {
  name: string
  amount: string
  category: string
  section: string
  tab: string
  tabLabel: string
  tabIcon: string
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function OPTAVIAReferenceGuide() {
  const [activeTab, setActiveTab] = useState('fats')
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showAllSpices, setShowAllSpices] = useState(false)

  // ============ SEARCH FUNCTIONALITY ============
  
  const getAllSearchableItems = (): SearchItem[] => {
    const items: SearchItem[] = []
    
    // Add healthy fats
    Object.entries(healthyFats).forEach(([, fatType]) => {
      fatType.categories.forEach(category => {
        category.items.forEach(item => {
          items.push({
            name: item.name,
            amount: item.amount,
            category: category.name,
            section: fatType.title,
            tab: 'fats',
            tabLabel: 'Healthy Fats',
            tabIcon: '🥑'
          })
        })
      })
    })
    
    // Add salad dressings
    saladDressings.forEach(brand => {
      brand.dressings.forEach(servingGroup => {
        servingGroup.items.forEach(item => {
          items.push({
            name: item,
            amount: servingGroup.serving,
            category: brand.brand,
            section: 'Salad Dressings',
            tab: 'dressings',
            tabLabel: 'Salad Dressings',
            tabIcon: '🥗'
          })
        })
      })
    })
    
    // Add condiments
    condimentSections.forEach(section => {
      section.items.forEach(item => {
        items.push({
          name: item.name,
          amount: item.amount,
          category: section.title,
          section: 'Condiments',
          tab: 'condiments',
          tabLabel: 'Condiments',
          tabIcon: '🧂'
        })
      })
    })
    
    // Add dried spices
    allDriedSpices.forEach(item => {
      items.push({
        name: item.name,
        amount: item.amount,
        category: 'Dried Herbs & Spices',
        section: 'Condiments',
        tab: 'condiments',
        tabLabel: 'Condiments',
        tabIcon: '🧂'
      })
    })
    
    return items
  }

  const getSearchResults = () => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    const allItems = getAllSearchableItems()
    return allItems.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
    )
  }

  const searchResults = getSearchResults()
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setIsSearching(value.trim().length > 0)
  }

  const clearSearch = () => {
    setSearchQuery('')
    setIsSearching(false)
  }

  // ============ RENDER FUNCTIONS ============

  const renderSearchResults = () => {
    if (searchResults.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No results found</h3>
          <p className="text-gray-500 text-sm">Try searching for something else, like "avocado" or "sriracha"</p>
        </div>
      )
    }

    // Group results by tab
    const groupedResults = searchResults.reduce((acc, item) => {
      if (!acc[item.tab]) {
        acc[item.tab] = {
          tabLabel: item.tabLabel,
          tabIcon: item.tabIcon,
          items: [] as SearchItem[]
        }
      }
      acc[item.tab].items.push(item)
      return acc
    }, {} as Record<string, { tabLabel: string; tabIcon: string; items: SearchItem[] }>)

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-gray-600 text-sm">
            Found <span className="font-semibold text-green-600">{searchResults.length}</span> results for "{searchQuery}"
          </p>
          <button 
            onClick={clearSearch}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            Clear search
          </button>
        </div>
        
        {Object.entries(groupedResults).map(([tabKey, group]) => (
          <div key={tabKey} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex items-center gap-2">
              <span className="text-lg">{group.tabIcon}</span>
              <h3 className="font-bold text-gray-800">{group.tabLabel}</h3>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full ml-auto">
                {group.items.length}
              </span>
            </div>
            <div className="p-3">
              <div className="grid md:grid-cols-2 gap-2">
                {group.items.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2 hover:bg-green-50 transition-colors"
                  >
                    <div>
                      <span className="text-gray-800 text-sm font-medium">{item.name}</span>
                      <span className="text-gray-400 text-xs ml-2">({item.category})</span>
                    </div>
                    <span className="text-green-600 font-semibold text-sm whitespace-nowrap">
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderFatsTab = () => (
    <div className="space-y-6">
      {/* Fats Rule Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0">1</div>
          <div>
            <h3 className="font-bold text-green-800">One Healthy Fat Serving =</h3>
            <p className="text-green-700">≈5g fat and &lt;5g carbohydrate</p>
            <p className="text-green-600 text-sm mt-1">Choose most servings from monounsaturated & polyunsaturated fats</p>
          </div>
        </div>
      </div>

      {/* Fat Categories */}
      {Object.entries(healthyFats).map(([key, fatType]) => (
        <div key={key} className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className={`px-5 py-3 ${
            fatType.color === 'emerald' ? 'bg-emerald-500' :
            fatType.color === 'blue' ? 'bg-blue-500' :
            'bg-amber-500'
          } text-white`}>
            <h3 className="font-bold text-lg">{fatType.title}</h3>
            <p className="text-sm opacity-90">{fatType.description}</p>
          </div>
          <div className="p-4 grid md:grid-cols-2 gap-4">
            {fatType.categories.map((category, catIdx) => (
              <div key={catIdx} className="bg-gray-50 rounded-lg p-3">
                <h4 className="font-semibold text-gray-700 text-sm mb-2 border-b border-gray-200 pb-1">
                  {category.name}
                </h4>
                <div className="space-y-1">
                  {category.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-1">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="text-green-600 font-medium">{item.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )

  const renderDressingsTab = () => (
    <div className="space-y-4">
      {/* Dressings Rule Card */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">🥗</span>
          <div>
            <h3 className="font-bold text-purple-800">Salad Dressings Count as Healthy Fats</h3>
            <p className="text-purple-700 text-sm">These approved dressings equal one healthy fat serving at the portions listed</p>
          </div>
        </div>
      </div>

      {/* Brand Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {saladDressings.map((brand, brandIdx) => (
          <div key={brandIdx} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className={`px-4 py-3 font-bold text-white ${
              brand.color === 'orange' ? 'bg-orange-500' :
              brand.color === 'green' ? 'bg-green-600' :
              brand.color === 'red' ? 'bg-red-500' :
              brand.color === 'blue' ? 'bg-blue-600' :
              brand.color === 'yellow' ? 'bg-yellow-500' :
              'bg-purple-500'
            }`}>
              {brand.brand}
            </div>
            <div className="p-3 space-y-3">
              {brand.dressings.map((servingGroup, sgIdx) => (
                servingGroup.items.length > 0 && (
                  <div key={sgIdx}>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
                        {servingGroup.serving}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {servingGroup.items.map((item, itemIdx) => (
                        <span key={itemIdx} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderCondimentsTab = () => (
    <div className="space-y-6">
      {/* Condiments Rule Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="bg-amber-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg shrink-0">3</div>
            <div>
              <h3 className="font-bold text-amber-800">Up to 3 Condiment Servings</h3>
              <p className="text-amber-700">per Lean & Green meal</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-amber-600 text-sm font-medium">Each serving =</p>
            <p className="text-amber-800 font-bold">≤1g carb</p>
          </div>
        </div>
      </div>

      {/* Dried Spices Section */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🧂</span>
            <h3 className="font-bold text-gray-800">Dried Herbs & Spices</h3>
          </div>
          <button 
            onClick={() => setShowAllSpices(!showAllSpices)}
            className="text-sm text-green-600 hover:text-green-700 font-medium"
          >
            {showAllSpices ? 'Show Popular' : 'Show All 48'}
          </button>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(showAllSpices ? allDriedSpices : popularSpices).map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 text-sm">
                <span className="text-gray-700">{item.name}</span>
                <span className="text-green-600 font-medium text-xs">{item.amount}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Condiment Categories */}
      <div className="grid md:grid-cols-2 gap-4">
        {condimentSections.map((section, sectionIdx) => (
          <div key={sectionIdx} className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-800 flex items-center gap-2">
                <span>{section.icon}</span>
                {section.title}
              </h3>
            </div>
            <div className="p-3 max-h-80 overflow-y-auto">
              <div className="space-y-1">
                {section.items.map((item, idx) => (
                  <div 
                    key={idx} 
                    className="flex justify-between items-center py-1.5 px-2 rounded hover:bg-green-50 transition-colors"
                  >
                    <span className="text-gray-700 text-sm">{item.name}</span>
                    <span className="text-green-600 font-semibold text-sm whitespace-nowrap ml-2">
                      {item.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="text-center text-gray-500 text-xs">
        <p>*Broth varies by brand — check label for ≤1g carb per serving</p>
        <p className="mt-1">Always read labels • When in doubt, measure it out!</p>
      </div>
    </div>
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white rounded-xl p-4">
        <h2 className="text-xl font-bold mb-1">OPTAVIA Quick Reference Guide</h2>
        <p className="text-green-100 text-sm mb-3">Optimal Weight 5 & 1 Plan</p>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search all fats, dressings & condiments..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-10 py-2.5 rounded-lg text-gray-800 placeholder-gray-400 bg-white border-0"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation - Hidden when searching */}
      {!isSearching && (
        <div className="bg-white rounded-xl shadow-sm">
          <div className="flex border-b">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors flex-1 justify-center ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Search Results Banner - Shown when searching */}
      {isSearching && (
        <div className="bg-white rounded-xl shadow-sm px-4 py-3 flex items-center gap-2">
          <Search className="h-4 w-4 text-green-500" />
          <span className="text-gray-600 font-medium">Search Results</span>
        </div>
      )}

      {/* Tab Content */}
      <div>
        {isSearching ? (
          renderSearchResults()
        ) : (
          <>
            {activeTab === 'fats' && renderFatsTab()}
            {activeTab === 'dressings' && renderDressingsTab()}
            {activeTab === 'condiments' && renderCondimentsTab()}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-gray-400 text-xs py-2">
        <p>Reference guide based on official OPTAVIA Optimal Weight 5 & 1 Plan guidelines</p>
      </div>
    </div>
  )
}
