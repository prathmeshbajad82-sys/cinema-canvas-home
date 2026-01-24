export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      movies: {
        Row: {
          id: string
          title: string
          description: string | null
          tagline: string | null
          duration: number | null
          release_date: string | null
          poster_url: string | null
          rating: number
          genres: string[]
          language: string
          is_available: boolean
          is_featured: boolean
          show_times: string[]
          ticket_price: number
          available_seats: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          tagline?: string | null
          duration?: number | null
          release_date?: string | null
          poster_url?: string | null
          rating?: number
          genres?: string[]
          language?: string
          is_available?: boolean
          is_featured?: boolean
          show_times?: string[]
          ticket_price?: number
          available_seats?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          tagline?: string | null
          duration?: number | null
          release_date?: string | null
          poster_url?: string | null
          rating?: number
          genres?: string[]
          language?: string
          is_available?: boolean
          is_featured?: boolean
          show_times?: string[]
          ticket_price?: number
          available_seats?: number
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          movie_id: string
          show_time: string
          booking_date: string
          seats: number
          total_amount: number
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
          booking_status: 'confirmed' | 'cancelled' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          movie_id: string
          show_time: string
          booking_date: string
          seats?: number
          total_amount: number
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          booking_status?: 'confirmed' | 'cancelled' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          movie_id?: string
          show_time?: string
          booking_date?: string
          seats?: number
          total_amount?: number
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded'
          booking_status?: 'confirmed' | 'cancelled' | 'completed'
          created_at?: string
          updated_at?: string
        }
      }
      user_preferences: {
        Row: {
          id: string
          user_id: string
          preferred_genres: string[]
          preferred_language: string
          notification_email: boolean
          notification_sms: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          preferred_genres?: string[]
          preferred_language?: string
          notification_email?: boolean
          notification_sms?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          preferred_genres?: string[]
          preferred_language?: string
          notification_email?: boolean
          notification_sms?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      is_own_booking: {
        Args: { booking_id: string }
        Returns: boolean
      }
      is_own_preference: {
        Args: { pref_user_id: string }
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
