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
      cities: {
        Row: {
          id: string
          slug: string
          name: string
          display_name: string
          domain: string
          site_url: string
          center_lat: number
          center_lng: number
          default_zoom: number
          geo_region: string
          geo_placename: string
          address_region: string
          default_sector_slug: string
          main_postal_codes: string[]
          meta_title: string
          meta_title_template: string
          meta_description: string
          meta_keywords: string[]
          og_site_name: string
          google_analytics_id: string | null
          contact_email: string
          contact_whatsapp: string | null
          logo_url: string | null
          hero_image_url: string | null
          editor_name: string
          seo_content: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          display_name: string
          domain: string
          site_url: string
          center_lat: number
          center_lng: number
          default_zoom?: number
          geo_region: string
          geo_placename: string
          address_region: string
          default_sector_slug: string
          main_postal_codes: string[]
          meta_title: string
          meta_title_template: string
          meta_description: string
          meta_keywords: string[]
          og_site_name: string
          google_analytics_id?: string | null
          contact_email: string
          contact_whatsapp?: string | null
          logo_url?: string | null
          hero_image_url?: string | null
          editor_name: string
          seo_content?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          display_name?: string
          domain?: string
          site_url?: string
          center_lat?: number
          center_lng?: number
          default_zoom?: number
          geo_region?: string
          geo_placename?: string
          address_region?: string
          default_sector_slug?: string
          main_postal_codes?: string[]
          meta_title?: string
          meta_title_template?: string
          meta_description?: string
          meta_keywords?: string[]
          og_site_name?: string
          google_analytics_id?: string | null
          contact_email?: string
          contact_whatsapp?: string | null
          logo_url?: string | null
          hero_image_url?: string | null
          editor_name?: string
          seo_content?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      city_redirects: {
        Row: {
          id: string
          city_id: string
          source_path: string
          destination_path: string
          permanent: boolean
        }
        Insert: {
          id?: string
          city_id: string
          source_path: string
          destination_path: string
          permanent?: boolean
        }
        Update: {
          id?: string
          city_id?: string
          source_path?: string
          destination_path?: string
          permanent?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "city_redirects_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          }
        ]
      }
      geographic_sectors: {
        Row: {
          center_lat: number
          center_lng: number
          city_id: string
          created_at: string
          display_name: string | null
          display_order: number
          id: string
          name: string
          postal_code: string | null
          radius: number
          slug: string
          updated_at: string
        }
        Insert: {
          center_lat: number
          center_lng: number
          city_id: string
          created_at?: string
          display_name?: string | null
          display_order?: number
          id?: string
          name: string
          postal_code?: string | null
          radius?: number
          slug: string
          updated_at?: string
        }
        Update: {
          center_lat?: number
          center_lng?: number
          city_id?: string
          created_at?: string
          display_name?: string | null
          display_order?: number
          id?: string
          name?: string
          postal_code?: string | null
          radius?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geographic_sectors_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          }
        ]
      }
      kebabs: {
        Row: {
          address: string
          category: string | null
          created_at: string
          description: string | null
          geocoded_at: string | null
          geocoding_status: string | null
          google_maps_link: string | null
          halal: boolean | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          main_category: string | null
          name: string
          opening_hours: Json | null
          phone: string | null
          priority_level: string | null
          rating: number | null
          reviews_count: number | null
          reviews_link: string | null
          services_info: Json | null
          short_address: string | null
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          address: string
          category?: string | null
          created_at?: string
          description?: string | null
          geocoded_at?: string | null
          geocoding_status?: string | null
          google_maps_link?: string | null
          halal?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          main_category?: string | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          priority_level?: string | null
          rating?: number | null
          reviews_count?: number | null
          reviews_link?: string | null
          services_info?: Json | null
          short_address?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          category?: string | null
          created_at?: string
          description?: string | null
          geocoded_at?: string | null
          geocoding_status?: string | null
          google_maps_link?: string | null
          halal?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          main_category?: string | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          priority_level?: string | null
          rating?: number | null
          reviews_count?: number | null
          reviews_link?: string | null
          services_info?: Json | null
          short_address?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      pizzerias: {
        Row: {
          address: string
          category: string | null
          city_id: string
          created_at: string
          description: string | null
          geocoded_at: string | null
          geocoding_status: string | null
          google_maps_link: string | null
          halal: boolean | null
          id: string
          image_url: string | null
          latitude: number | null
          longitude: number | null
          main_category: string | null
          name: string
          opening_hours: Json | null
          phone: string | null
          priority_level: string | null
          rating: number | null
          reviews_count: number | null
          reviews_link: string | null
          services_info: Json | null
          short_address: string | null
          subcategory: string | null
          updated_at: string
        }
        Insert: {
          address: string
          category?: string | null
          city_id: string
          created_at?: string
          description?: string | null
          geocoded_at?: string | null
          geocoding_status?: string | null
          google_maps_link?: string | null
          halal?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          main_category?: string | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          priority_level?: string | null
          rating?: number | null
          reviews_count?: number | null
          reviews_link?: string | null
          services_info?: Json | null
          short_address?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          category?: string | null
          city_id?: string
          created_at?: string
          description?: string | null
          geocoded_at?: string | null
          geocoding_status?: string | null
          google_maps_link?: string | null
          halal?: boolean | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          longitude?: number | null
          main_category?: string | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          priority_level?: string | null
          rating?: number | null
          reviews_count?: number | null
          reviews_link?: string | null
          services_info?: Json | null
          short_address?: string | null
          subcategory?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pizzerias_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          }
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
