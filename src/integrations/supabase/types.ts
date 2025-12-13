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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      einheiten: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
          typ: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
          typ?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
          typ?: string
        }
        Relationships: []
      }
      kategorien: {
        Row: {
          created_at: string
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      leitstellenblatt: {
        Row: {
          hinweise: string | null
          id: string
          leitstelle_id: string | null
          supervisor_id: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          hinweise?: string | null
          id?: string
          leitstelle_id?: string | null
          supervisor_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          hinweise?: string | null
          id?: string
          leitstelle_id?: string | null
          supervisor_id?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leitstellenblatt_leitstelle_id_fkey"
            columns: ["leitstelle_id"]
            isOneToOne: false
            referencedRelation: "mitarbeiter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leitstellenblatt_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "mitarbeiter"
            referencedColumns: ["id"]
          },
        ]
      }
      leitstellenblatt_einheiten: {
        Row: {
          einheit_id: string | null
          funker_id: string | null
          id: string
          leitstellenblatt_id: string | null
          mitarbeiter_id: string | null
          sort_order: number
        }
        Insert: {
          einheit_id?: string | null
          funker_id?: string | null
          id?: string
          leitstellenblatt_id?: string | null
          mitarbeiter_id?: string | null
          sort_order?: number
        }
        Update: {
          einheit_id?: string | null
          funker_id?: string | null
          id?: string
          leitstellenblatt_id?: string | null
          mitarbeiter_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "leitstellenblatt_einheiten_einheit_id_fkey"
            columns: ["einheit_id"]
            isOneToOne: false
            referencedRelation: "einheiten"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leitstellenblatt_einheiten_funker_id_fkey"
            columns: ["funker_id"]
            isOneToOne: false
            referencedRelation: "mitarbeiter"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leitstellenblatt_einheiten_leitstellenblatt_id_fkey"
            columns: ["leitstellenblatt_id"]
            isOneToOne: false
            referencedRelation: "leitstellenblatt"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leitstellenblatt_einheiten_mitarbeiter_id_fkey"
            columns: ["mitarbeiter_id"]
            isOneToOne: false
            referencedRelation: "mitarbeiter"
            referencedColumns: ["id"]
          },
        ]
      }
      mitarbeiter: {
        Row: {
          abteilung: string
          created_at: string
          dienstnummer: string
          geraete: string | null
          id: string
          name: string
          notizen: string | null
          qualifikationen: string | null
          rang: string
          status: string
          updated_at: string
        }
        Insert: {
          abteilung: string
          created_at?: string
          dienstnummer: string
          geraete?: string | null
          id?: string
          name: string
          notizen?: string | null
          qualifikationen?: string | null
          rang: string
          status?: string
          updated_at?: string
        }
        Update: {
          abteilung?: string
          created_at?: string
          dienstnummer?: string
          geraete?: string | null
          id?: string
          name?: string
          notizen?: string | null
          qualifikationen?: string | null
          rang?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
          must_change_password: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
          must_change_password?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
          must_change_password?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      strafkatalog_lock: {
        Row: {
          expires_at: string
          id: string
          locked_at: string
          user_id: string
          user_name: string
        }
        Insert: {
          expires_at?: string
          id?: string
          locked_at?: string
          user_id: string
          user_name: string
        }
        Update: {
          expires_at?: string
          id?: string
          locked_at?: string
          user_id?: string
          user_name?: string
        }
        Relationships: []
      }
      straftaten: {
        Row: {
          created_at: string
          geldstrafe: number
          haftzeit: number
          id: string
          kategorie_id: string
          name: string
          sort_order: number
          typ: Database["public"]["Enums"]["straftat_typ"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          geldstrafe?: number
          haftzeit?: number
          id?: string
          kategorie_id: string
          name: string
          sort_order?: number
          typ?: Database["public"]["Enums"]["straftat_typ"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          geldstrafe?: number
          haftzeit?: number
          id?: string
          kategorie_id?: string
          name?: string
          sort_order?: number
          typ?: Database["public"]["Enums"]["straftat_typ"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "straftaten_kategorie_id_fkey"
            columns: ["kategorie_id"]
            isOneToOne: false
            referencedRelation: "kategorien"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      straftat_typ: "Verbrechen" | "Ordnungswidrigkeit" | "Verstoß"
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
      app_role: ["admin", "user"],
      straftat_typ: ["Verbrechen", "Ordnungswidrigkeit", "Verstoß"],
    },
  },
} as const
