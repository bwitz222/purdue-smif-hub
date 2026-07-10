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
      benchmark_monthly: {
        Row: {
          close: number
          fetched_at: string
          month: string
          return_pct: number | null
          symbol: string
        }
        Insert: {
          close: number
          fetched_at?: string
          month: string
          return_pct?: number | null
          symbol: string
        }
        Update: {
          close?: number
          fetched_at?: string
          month?: string
          return_pct?: number | null
          symbol?: string
        }
        Relationships: []
      }
      contact_inquiries: {
        Row: {
          company: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          topic: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          topic: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          topic?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          delivered: boolean
          email: string
          first_name: string
          id: string
          last_name: string
          message: string
          subject: string
        }
        Insert: {
          created_at?: string
          delivered?: boolean
          email: string
          first_name: string
          id?: string
          last_name: string
          message: string
          subject: string
        }
        Update: {
          created_at?: string
          delivered?: boolean
          email?: string
          first_name?: string
          id?: string
          last_name?: string
          message?: string
          subject?: string
        }
        Relationships: []
      }
      fund_monthly_history: {
        Row: {
          beginning_balance: number
          created_at: string
          deposits: number
          dividends: number
          ending_balance: number
          interest: number
          is_transition: boolean
          market_change: number
          month: string
          net_advisory_fees: number
          updated_at: string
          withdrawals: number
        }
        Insert: {
          beginning_balance?: number
          created_at?: string
          deposits?: number
          dividends?: number
          ending_balance?: number
          interest?: number
          is_transition?: boolean
          market_change?: number
          month: string
          net_advisory_fees?: number
          updated_at?: string
          withdrawals?: number
        }
        Update: {
          beginning_balance?: number
          created_at?: string
          deposits?: number
          dividends?: number
          ending_balance?: number
          interest?: number
          is_transition?: boolean
          market_change?: number
          month?: string
          net_advisory_fees?: number
          updated_at?: string
          withdrawals?: number
        }
        Relationships: []
      }
      fund_performance: {
        Row: {
          bench_return: number
          is_audited: boolean
          smif_return: number
          updated_at: string
          year: number
        }
        Insert: {
          bench_return: number
          is_audited?: boolean
          smif_return: number
          updated_at?: string
          year: number
        }
        Update: {
          bench_return?: number
          is_audited?: boolean
          smif_return?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      fund_performance_kpis: {
        Row: {
          five_year_annualized: number
          id: boolean
          inception_annualized: number
          one_year: number
          updated_at: string
        }
        Insert: {
          five_year_annualized: number
          id?: boolean
          inception_annualized: number
          one_year: number
          updated_at?: string
        }
        Update: {
          five_year_annualized?: number
          id?: boolean
          inception_annualized?: number
          one_year?: number
          updated_at?: string
        }
        Relationships: []
      }
      fund_stats: {
        Row: {
          active_members: string
          aum_display: string
          cash_holdings: number
          founded_year: number
          id: boolean
          sector_teams: number
          updated_at: string
        }
        Insert: {
          active_members: string
          aum_display: string
          cash_holdings: number
          founded_year: number
          id?: boolean
          sector_teams: number
          updated_at?: string
        }
        Update: {
          active_members?: string
          aum_display?: string
          cash_holdings?: number
          founded_year?: number
          id?: boolean
          sector_teams?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_risk_metrics: {
        Row: {
          annualized_return_pct: number | null
          annualized_vol_pct: number | null
          as_of: string
          computed_at: string
          full_year: boolean
          gross_exposure_pct: number | null
          lookback_days: number
          net_exposure_pct: number | null
          portfolio_value: number | null
          rf_source: string | null
          risk_free_rate_pct: number | null
          sharpe: number | null
          sufficient: boolean
          symbols_priced: number | null
          var95_dollar: number | null
          var95_pct: number | null
          var99_dollar: number | null
          var99_pct: number | null
        }
        Insert: {
          annualized_return_pct?: number | null
          annualized_vol_pct?: number | null
          as_of: string
          computed_at?: string
          full_year?: boolean
          gross_exposure_pct?: number | null
          lookback_days: number
          net_exposure_pct?: number | null
          portfolio_value?: number | null
          rf_source?: string | null
          risk_free_rate_pct?: number | null
          sharpe?: number | null
          sufficient?: boolean
          symbols_priced?: number | null
          var95_dollar?: number | null
          var95_pct?: number | null
          var99_dollar?: number | null
          var99_pct?: number | null
        }
        Update: {
          annualized_return_pct?: number | null
          annualized_vol_pct?: number | null
          as_of?: string
          computed_at?: string
          full_year?: boolean
          gross_exposure_pct?: number | null
          lookback_days?: number
          net_exposure_pct?: number | null
          portfolio_value?: number | null
          rf_source?: string | null
          risk_free_rate_pct?: number | null
          sharpe?: number | null
          sufficient?: boolean
          symbols_priced?: number | null
          var95_dollar?: number | null
          var95_pct?: number | null
          var99_dollar?: number | null
          var99_pct?: number | null
        }
        Relationships: []
      }
      price_history: {
        Row: {
          close: number
          date: string
          symbol: string
          updated_at: string
        }
        Insert: {
          close: number
          date: string
          symbol: string
          updated_at?: string
        }
        Update: {
          close?: number
          date?: string
          symbol?: string
          updated_at?: string
        }
        Relationships: []
      }
      publications: {
        Row: {
          category: Database["public"]["Enums"]["publication_category"]
          created_at: string
          description: string | null
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          title: string
        }
        Insert: {
          category: Database["public"]["Enums"]["publication_category"]
          created_at?: string
          description?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          title: string
        }
        Update: {
          category?: Database["public"]["Enums"]["publication_category"]
          created_at?: string
          description?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          title?: string
        }
        Relationships: []
      }
      quote_cache: {
        Row: {
          change_pct: number
          fetched_at: string
          price: number
          symbol: string
        }
        Insert: {
          change_pct?: number
          fetched_at?: string
          price: number
          symbol: string
        }
        Update: {
          change_pct?: number
          fetched_at?: string
          price?: number
          symbol?: string
        }
        Relationships: []
      }
      quote_meta: {
        Row: {
          key: string
          updated_at: string
          value_ts: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value_ts?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value_ts?: string | null
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
      publication_category: "equity_research" | "semester" | "annual"
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
      publication_category: ["equity_research", "semester", "annual"],
    },
  },
} as const
