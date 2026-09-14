export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      chore_assignments: {
        Row: {
          chore_id: string
          created_at: string
          cycle_start: string
          done: boolean
          done_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          chore_id: string
          created_at?: string
          cycle_start?: string
          done?: boolean
          done_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          chore_id?: string
          created_at?: string
          cycle_start?: string
          done?: boolean
          done_at?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chore_assignments_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "chores"
            referencedColumns: ["id"]
          },
        ]
      }
      chores: {
        Row: {
          created_at: string
          household_id: string
          id: string
          name: string
          recurrence_days: number
        }
        Insert: {
          created_at?: string
          household_id: string
          id?: string
          name: string
          recurrence_days?: number
        }
        Update: {
          created_at?: string
          household_id?: string
          id?: string
          name?: string
          recurrence_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "chores_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_splits: {
        Row: {
          amount_owed: number
          expense_id: string
          id: string
          settled: boolean
          user_id: string
        }
        Insert: {
          amount_owed: number
          expense_id: string
          id?: string
          settled?: boolean
          user_id: string
        }
        Update: {
          amount_owed?: number
          expense_id?: string
          id?: string
          settled?: boolean
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_splits_expense_id_fkey"
            columns: ["expense_id"]
            isOneToOne: false
            referencedRelation: "expenses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          created_at: string
          description: string
          household_id: string
          id: string
          payer_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description: string
          household_id: string
          id?: string
          payer_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          household_id?: string
          id?: string
          payer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      grocery_items: {
        Row: {
          added_by: string
          bought: boolean
          created_at: string
          household_id: string
          id: string
          name: string
        }
        Insert: {
          added_by: string
          bought?: boolean
          created_at?: string
          household_id: string
          id?: string
          name: string
        }
        Update: {
          added_by?: string
          bought?: boolean
          created_at?: string
          household_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "grocery_items_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      household_members: {
        Row: {
          display_name: string
          household_id: string
          id: string
          joined_at: string
          position: number
          user_id: string
        }
        Insert: {
          display_name: string
          household_id: string
          id?: string
          joined_at?: string
          position: number
          user_id: string
        }
        Update: {
          display_name?: string
          household_id?: string
          id?: string
          joined_at?: string
          position?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "household_members_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
      households: {
        Row: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      quiet_hours: {
        Row: {
          day_of_week: number
          end_time: string
          household_id: string
          id: string
          start_time: string
          user_id: string
        }
        Insert: {
          day_of_week: number
          end_time: string
          household_id: string
          id?: string
          start_time: string
          user_id: string
        }
        Update: {
          day_of_week?: number
          end_time?: string
          household_id?: string
          id?: string
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiet_hours_household_id_fkey"
            columns: ["household_id"]
            isOneToOne: false
            referencedRelation: "households"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_household: {
        Args: { p_name: string }
        Returns: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
      }
      is_household_member: { Args: { hid: string }; Returns: boolean }
      join_household: {
        Args: { p_code: string }
        Returns: {
          created_at: string
          created_by: string
          id: string
          invite_code: string
          name: string
        }
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"]
export type TablesInsert<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Insert"]
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Update"]
