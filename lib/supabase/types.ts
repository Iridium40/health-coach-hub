export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          is_new_coach: boolean
          optavia_id: string | null
          parent_optavia_id: string | null
          coach_name: string | null
          signup_access_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_new_coach?: boolean
          optavia_id?: string | null
          parent_optavia_id?: string | null
          coach_name?: string | null
          signup_access_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          is_new_coach?: boolean
          optavia_id?: string | null
          parent_optavia_id?: string | null
          coach_name?: string | null
          signup_access_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          completed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          completed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          completed_at?: string
        }
      }
      user_bookmarks: {
        Row: {
          id: string
          user_id: string
          resource_id: string
          source: string
          bookmarked_at: string
        }
        Insert: {
          id?: string
          user_id: string
          resource_id: string
          source?: string
          bookmarked_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          resource_id?: string
          source?: string
          bookmarked_at?: string
        }
      }
      favorite_recipes: {
        Row: {
          id: string
          user_id: string
          recipe_id: string
          favorited_at: string
        }
        Insert: {
          id?: string
          user_id: string
          recipe_id: string
          favorited_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          recipe_id?: string
          favorited_at?: string
        }
      }
      notification_settings: {
        Row: {
          id: string
          user_id: string
          push_enabled: boolean
          announcements_enabled: boolean
          progress_updates_enabled: boolean
          email_notifications: boolean
          push_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          push_enabled?: boolean
          announcements_enabled?: boolean
          progress_updates_enabled?: boolean
          email_notifications?: boolean
          push_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          push_enabled?: boolean
          announcements_enabled?: boolean
          progress_updates_enabled?: boolean
          email_notifications?: boolean
          push_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          priority: "low" | "normal" | "high" | "urgent"
          is_active: boolean
          send_push: boolean
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          priority?: "low" | "normal" | "high" | "urgent"
          is_active?: boolean
          send_push?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          priority?: "low" | "normal" | "high" | "urgent"
          is_active?: boolean
          send_push?: boolean
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      signup_access_codes: {
        Row: {
          id: string
          code: string
          label: string | null
          is_active: boolean
          usage_count: number
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          label?: string | null
          is_active?: boolean
          usage_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          label?: string | null
          is_active?: boolean
          usage_count?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      announcement_reads: {
        Row: {
          id: string
          user_id: string
          announcement_id: string
          read_at: string
        }
        Insert: {
          id?: string
          user_id: string
          announcement_id: string
          read_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          announcement_id?: string
          read_at?: string
        }
      }
    }
  }
}

