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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      budget: {
        Row: {
          created_at: string
          date: string
          debt: Json
          disposable_income: number
          expenses: Json
          id: string
          income: number
          savings_rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          debt?: Json
          disposable_income?: number
          expenses?: Json
          id?: string
          income?: number
          savings_rate?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          debt?: Json
          disposable_income?: number
          expenses?: Json
          id?: string
          income?: number
          savings_rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      market: {
        Row: {
          created_at: string
          date: string
          home_price: number
          id: string
          insurance_rate: number
          interest_rate: number
          price_growth: number
          state: string
          tax_rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          home_price?: number
          id?: string
          insurance_rate?: number
          interest_rate?: number
          price_growth?: number
          state?: string
          tax_rate?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          home_price?: number
          id?: string
          insurance_rate?: number
          interest_rate?: number
          price_growth?: number
          state?: string
          tax_rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      milestone: {
        Row: {
          alert: boolean
          created_at: string
          date: string
          description: string
          id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert?: boolean
          created_at?: string
          date: string
          description: string
          id?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert?: boolean
          created_at?: string
          date?: string
          description?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      mortgage: {
        Row: {
          affordable_price: number
          created_at: string
          date: string
          down_percent: number
          dti: number
          hoa: number
          home_price: number
          id: string
          insurance_rate: number
          loan_term: number
          maintenance_rate: number
          monthly_payment: number
          pmi_rate: number
          rate: number
          tax_rate: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affordable_price?: number
          created_at?: string
          date?: string
          down_percent?: number
          dti?: number
          hoa?: number
          home_price?: number
          id?: string
          insurance_rate?: number
          loan_term?: number
          maintenance_rate?: number
          monthly_payment?: number
          pmi_rate?: number
          rate?: number
          tax_rate?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affordable_price?: number
          created_at?: string
          date?: string
          down_percent?: number
          dti?: number
          hoa?: number
          home_price?: number
          id?: string
          insurance_rate?: number
          loan_term?: number
          maintenance_rate?: number
          monthly_payment?: number
          pmi_rate?: number
          rate?: number
          tax_rate?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      savings: {
        Row: {
          created_at: string
          date: string
          down_payment: number
          emergency_fund: number
          goal: number
          id: string
          maintenance: number
          months_left: number
          moving_setup: number
          percent_to_goal: number
          total_savings: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          down_payment?: number
          emergency_fund?: number
          goal?: number
          id?: string
          maintenance?: number
          months_left?: number
          moving_setup?: number
          percent_to_goal?: number
          total_savings?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          down_payment?: number
          emergency_fund?: number
          goal?: number
          id?: string
          maintenance?: number
          months_left?: number
          moving_setup?: number
          percent_to_goal?: number
          total_savings?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          credit_score: number
          debt: number
          expenses: number
          id: string
          income: number
          name: string
          state: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credit_score?: number
          debt?: number
          expenses?: number
          id?: string
          income?: number
          name?: string
          state?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credit_score?: number
          debt?: number
          expenses?: number
          id?: string
          income?: number
          name?: string
          state?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_notification: {
        Args: {
          notification_data?: Json
          notification_message: string
          notification_title: string
          notification_type: string
          target_user_id: string
        }
        Returns: string
      }
      generate_employee_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_job_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_admin_role: {
        Args: { user_id?: string }
        Returns: Database["public"]["Enums"]["admin_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { user_id?: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_role: "super_admin" | "admin" | "moderator"
      app_role: "super_admin" | "admin" | "manager" | "employee"
      employee_status: "active" | "inactive" | "terminated" | "on_leave"
      job_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "rescheduled"
        | "pending_schedule"
      lead_source:
        | "website"
        | "referral"
        | "google_ads"
        | "facebook"
        | "phone"
        | "walk_in"
        | "other"
      lead_status: "new" | "contacted" | "quoted" | "converted" | "lost"
      match_status: "pending" | "matched" | "rejected"
      message_status: "sent" | "delivered" | "read"
      profile_status: "active" | "inactive" | "suspended"
      subscription_status: "free" | "paid" | "expired"
      time_entry_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_role: ["super_admin", "admin", "moderator"],
      app_role: ["super_admin", "admin", "manager", "employee"],
      employee_status: ["active", "inactive", "terminated", "on_leave"],
      job_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "rescheduled",
        "pending_schedule",
      ],
      lead_source: [
        "website",
        "referral",
        "google_ads",
        "facebook",
        "phone",
        "walk_in",
        "other",
      ],
      lead_status: ["new", "contacted", "quoted", "converted", "lost"],
      match_status: ["pending", "matched", "rejected"],
      message_status: ["sent", "delivered", "read"],
      profile_status: ["active", "inactive", "suspended"],
      subscription_status: ["free", "paid", "expired"],
      time_entry_status: ["pending", "approved", "rejected"],
    },
  },
} as const
