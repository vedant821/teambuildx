export type Database = {
  public: {
    Tables: {
      users_profile: {
        Row: {
          id: string
          full_name: string
          role: 'admin' | 'user'
          skills: string | null
        }
        Insert: {
          id: string
          full_name: string
          role?: 'admin' | 'user'
          skills?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          role?: 'admin' | 'user'
          skills?: string | null
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          date: string
          is_paid: boolean
          upi_id: string | null
          fee_amount: number | null
          created_by: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          date: string
          is_paid: boolean
          upi_id?: string | null
          fee_amount?: number | null
          created_by: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          date?: string
          is_paid?: boolean
          upi_id?: string | null
          fee_amount?: number | null
          created_by?: string
        }
        Relationships: []
      }
      registrations: {
        Row: {
          id: string
          user_id: string
          event_id: string
          status: 'pending' | 'approved' | 'rejected'
          transaction_id: string | null
          screenshot_url: string | null
        }
        Insert: {
          id?: string
          user_id: string
          event_id: string
          status?: 'pending' | 'approved' | 'rejected'
          transaction_id?: string | null
          screenshot_url?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          event_id?: string
          status?: 'pending' | 'approved' | 'rejected'
          transaction_id?: string | null
          screenshot_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
