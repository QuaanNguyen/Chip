export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      calendar_events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          event_type: string
          id: string
          is_recurring: boolean | null
          notes: string | null
          partnership_id: string
          recurrence_type: string | null
          remind_days_before: number[] | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          event_type: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          partnership_id: string
          recurrence_type?: string | null
          remind_days_before?: number[] | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          event_type?: string
          id?: string
          is_recurring?: boolean | null
          notes?: string | null
          partnership_id?: string
          recurrence_type?: string | null
          remind_days_before?: number[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "calendar_events_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      date_plans: {
        Row: {
          budget_estimate: number | null
          created_at: string
          created_by: string
          description: string | null
          extras: Json | null
          id: string
          notes: string | null
          partnership_id: string
          places: Json | null
          scheduled_for: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          budget_estimate?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          extras?: Json | null
          id?: string
          notes?: string | null
          partnership_id: string
          places?: Json | null
          scheduled_for?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          budget_estimate?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          extras?: Json | null
          id?: string
          notes?: string | null
          partnership_id?: string
          places?: Json | null
          scheduled_for?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "date_plans_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      nudge_rules: {
        Row: {
          config: Json
          cooldown_minutes: number | null
          created_at: string
          id: string
          is_enabled: boolean | null
          partnership_id: string
          rule_type: string
          updated_at: string
        }
        Insert: {
          config?: Json
          cooldown_minutes?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          partnership_id: string
          rule_type: string
          updated_at?: string
        }
        Update: {
          config?: Json
          cooldown_minutes?: number | null
          created_at?: string
          id?: string
          is_enabled?: boolean | null
          partnership_id?: string
          rule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "nudge_rules_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      nudges_log: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          message: string
          partnership_id: string
          rule_id: string | null
          rule_type: string
          user_id: string
          was_acted_on: boolean | null
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          message: string
          partnership_id: string
          rule_id?: string | null
          rule_type: string
          user_id: string
          was_acted_on?: boolean | null
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          message?: string
          partnership_id?: string
          rule_id?: string | null
          rule_type?: string
          user_id?: string
          was_acted_on?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "nudges_log_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nudges_log_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "nudge_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      partnerships: {
        Row: {
          created_at: string
          id: string
          invite_code: string
          paired_at: string | null
          status: string
          updated_at: string
          user1_id: string | null
          user2_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          invite_code: string
          paired_at?: string | null
          status?: string
          updated_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          invite_code?: string
          paired_at?: string | null
          status?: string
          updated_at?: string
          user1_id?: string | null
          user2_id?: string | null
        }
        Relationships: []
      }
      privacy_settings: {
        Row: {
          created_at: string
          id: string
          location_mode: string
          location_sharing_enabled: boolean | null
          privacy_paused: boolean | null
          privacy_paused_until: string | null
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          share_battery: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_mode?: string
          location_sharing_enabled?: boolean | null
          privacy_paused?: boolean | null
          privacy_paused_until?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          share_battery?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_mode?: string
          location_sharing_enabled?: boolean | null
          privacy_paused?: boolean | null
          privacy_paused_until?: string | null
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          share_battery?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          favorites: Json | null
          partnership_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          favorites?: Json | null
          partnership_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          favorites?: Json | null
          partnership_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      shared_places: {
        Row: {
          address: string | null
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          latitude: number
          longitude: number
          name: string
          notes: string | null
          partnership_id: string
          photos: Json | null
          rating: number | null
          updated_at: string
          visited: boolean | null
          visited_at: string | null
        }
        Insert: {
          address?: string | null
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          latitude: number
          longitude: number
          name: string
          notes?: string | null
          partnership_id: string
          photos?: Json | null
          rating?: number | null
          updated_at?: string
          visited?: boolean | null
          visited_at?: string | null
        }
        Update: {
          address?: string | null
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          notes?: string | null
          partnership_id?: string
          photos?: Json | null
          rating?: number | null
          updated_at?: string
          visited?: boolean | null
          visited_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_places_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
      user_locations: {
        Row: {
          accuracy: number | null
          battery_level: number | null
          created_at: string
          expires_at: string
          id: string
          is_charging: boolean | null
          is_live: boolean | null
          latitude: number
          live_expires_at: string | null
          location_mode: string
          longitude: number
          partnership_id: string
          user_id: string
        }
        Insert: {
          accuracy?: number | null
          battery_level?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          is_charging?: boolean | null
          is_live?: boolean | null
          latitude: number
          live_expires_at?: string | null
          location_mode?: string
          longitude: number
          partnership_id: string
          user_id: string
        }
        Update: {
          accuracy?: number | null
          battery_level?: number | null
          created_at?: string
          expires_at?: string
          id?: string
          is_charging?: boolean | null
          is_live?: boolean | null
          latitude?: number
          live_expires_at?: string | null
          location_mode?: string
          longitude?: number
          partnership_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_locations_partnership_id_fkey"
            columns: ["partnership_id"]
            isOneToOne: false
            referencedRelation: "partnerships"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_partnership: { Args: Record<string, never>; Returns: Json }
      dissolve_partnership: { Args: Record<string, never>; Returns: boolean }
      email_exists: { Args: { p_email: string }; Returns: boolean }
      generate_invite_code: { Args: Record<string, never>; Returns: string }
      get_partner_info: { Args: Record<string, never>; Returns: Json }
      join_partnership: { Args: { p_invite_code: string }; Returns: Json }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"]
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"]

