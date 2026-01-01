export interface UserData {
  isNewCoach: boolean
  completedResources: string[]
  bookmarks: string[]
  favoriteRecipes: string[]
  createdAt: string
}

export interface Resource {
  id: string
  title: string
  type: "doc" | "video"
  url: string
}

export interface Module {
  id: string
  title: string
  description: string
  category: "Getting Started" | "Client Support" | "Business Building" | "Training"
  order: number
  forNewCoach: boolean
  icon: string
  resources: Resource[]
}

export interface Recipe {
  id: string
  title: string
  description: string
  image: string
  category: "Chicken" | "Seafood" | "Beef" | "Turkey" | "Pork" | "Vegetarian" | "Breakfast"
  prepTime: number
  cookTime: number
  servings: number
  difficulty: "Easy" | "Medium" | "Hard"
  counts: {
    lean: number
    green: number
    fat: number
    condiment: number
  }
  ingredients: string[]
  instructions: string[]
  favoriteCount?: number
}

export interface ZoomCall {
  id: string
  title: string
  description: string | null
  call_type: "coach_only" | "with_clients"
  scheduled_at: string
  duration_minutes: number
  timezone: string
  is_recurring: boolean
  recurrence_pattern: string | null
  recurrence_day: string | null
  zoom_link: string | null
  zoom_meeting_id: string | null
  zoom_passcode: string | null
  recording_url: string | null
  recording_platform: "zoom" | "vimeo" | "youtube" | null
  recording_available_at: string | null
  status: "upcoming" | "live" | "completed" | "cancelled"
  created_by: string | null
  created_at: string
  updated_at: string
  // Event-specific fields
  event_type?: "meeting" | "event"
  end_date?: string | null
  location?: string | null
  is_virtual?: boolean
}
