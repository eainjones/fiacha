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
    PostgrestVersion: "14.1"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      counties: {
        Row: {
          created_at: string | null
          id: number
          name: string
          province: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
          province?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
          province?: string | null
        }
        Relationships: []
      }
      electoral_areas: {
        Row: {
          area_type: string | null
          created_at: string | null
          id: number
          local_authority_id: number | null
          name: string
        }
        Insert: {
          area_type?: string | null
          created_at?: string | null
          id?: number
          local_authority_id?: number | null
          name: string
        }
        Update: {
          area_type?: string | null
          created_at?: string | null
          id?: number
          local_authority_id?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "electoral_areas_local_authority_id_fkey"
            columns: ["local_authority_id"]
            isOneToOne: false
            referencedRelation: "local_authorities"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence: {
        Row: {
          created_at: string | null
          description: string | null
          id: number
          promise_id: number | null
          published_date: string | null
          source_type: string | null
          source_url: string | null
          title: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: number
          promise_id?: number | null
          published_date?: string | null
          source_type?: string | null
          source_url?: string | null
          title?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: number
          promise_id?: number | null
          published_date?: string | null
          source_type?: string | null
          source_url?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_promise_id_fkey"
            columns: ["promise_id"]
            isOneToOne: false
            referencedRelation: "promises"
            referencedColumns: ["id"]
          },
        ]
      }
      local_authorities: {
        Row: {
          authority_type: string | null
          county_id: number | null
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          authority_type?: string | null
          county_id?: number | null
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          authority_type?: string | null
          county_id?: number | null
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "local_authorities_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          achieved: boolean | null
          created_at: string | null
          description: string | null
          id: number
          milestone_date: string | null
          promise_id: number | null
          title: string
        }
        Insert: {
          achieved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: number
          milestone_date?: string | null
          promise_id?: number | null
          title: string
        }
        Update: {
          achieved?: boolean | null
          created_at?: string | null
          description?: string | null
          id?: number
          milestone_date?: string | null
          promise_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_promise_id_fkey"
            columns: ["promise_id"]
            isOneToOne: false
            referencedRelation: "promises"
            referencedColumns: ["id"]
          },
        ]
      }
      parties: {
        Row: {
          active: boolean | null
          color: string | null
          created_at: string | null
          id: number
          logo_url: string | null
          name: string
          region: string | null
          short_name: string | null
          website: string | null
        }
        Insert: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: number
          logo_url?: string | null
          name: string
          region?: string | null
          short_name?: string | null
          website?: string | null
        }
        Update: {
          active?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: number
          logo_url?: string | null
          name?: string
          region?: string | null
          short_name?: string | null
          website?: string | null
        }
        Relationships: []
      }
      politicians: {
        Row: {
          active: boolean | null
          constituency: string | null
          county_id: number | null
          created_at: string | null
          electoral_area_id: number | null
          id: number
          local_authority_id: number | null
          name: string
          party: string | null
          party_id: number | null
          position_type: string | null
          role: string | null
          term_end: string | null
          term_start: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          constituency?: string | null
          county_id?: number | null
          created_at?: string | null
          electoral_area_id?: number | null
          id?: number
          local_authority_id?: number | null
          name: string
          party?: string | null
          party_id?: number | null
          position_type?: string | null
          role?: string | null
          term_end?: string | null
          term_start?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          constituency?: string | null
          county_id?: number | null
          created_at?: string | null
          electoral_area_id?: number | null
          id?: number
          local_authority_id?: number | null
          name?: string
          party?: string | null
          party_id?: number | null
          position_type?: string | null
          role?: string | null
          term_end?: string | null
          term_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "politicians_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "politicians_electoral_area_id_fkey"
            columns: ["electoral_area_id"]
            isOneToOne: false
            referencedRelation: "electoral_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "politicians_local_authority_id_fkey"
            columns: ["local_authority_id"]
            isOneToOne: false
            referencedRelation: "local_authorities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "politicians_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      promises: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: number
          politician_id: number | null
          promise_date: string | null
          score: number | null
          status: string | null
          target_date: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          politician_id?: number | null
          promise_date?: string | null
          score?: number | null
          status?: string | null
          target_date?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          politician_id?: number | null
          promise_date?: string | null
          score?: number | null
          status?: string | null
          target_date?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promises_politician_id_fkey"
            columns: ["politician_id"]
            isOneToOne: false
            referencedRelation: "politicians"
            referencedColumns: ["id"]
          },
        ]
      }
      status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          evidence_ids: number[] | null
          id: number
          promise_id: number | null
          rationale: string | null
          score: number | null
          status: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          evidence_ids?: number[] | null
          id?: number
          promise_id?: number | null
          rationale?: string | null
          score?: number | null
          status: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          evidence_ids?: number[] | null
          id?: number
          promise_id?: number | null
          rationale?: string | null
          score?: number | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_history_promise_id_fkey"
            columns: ["promise_id"]
            isOneToOne: false
            referencedRelation: "promises"
            referencedColumns: ["id"]
          },
        ]
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
