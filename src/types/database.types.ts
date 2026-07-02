export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      articles: {
        Row: {
          author_id: string | null
          body_markdown: string
          cover_image_url: string | null
          created_at: string
          id: string
          published_at: string | null
          related_book_id: string | null
          related_category_id: string | null
          slug: string
          status: string
          title: string
        }
        Insert: {
          author_id?: string | null
          body_markdown: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          related_book_id?: string | null
          related_category_id?: string | null
          slug: string
          status?: string
          title: string
        }
        Update: {
          author_id?: string | null
          body_markdown?: string
          cover_image_url?: string | null
          created_at?: string
          id?: string
          published_at?: string | null
          related_book_id?: string | null
          related_category_id?: string | null
          slug?: string
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "articles_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_related_book_id_fkey"
            columns: ["related_book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "articles_related_category_id_fkey"
            columns: ["related_category_id"]
            isOneToOne: false
            referencedRelation: "book_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      book_categories: {
        Row: {
          cover_image_url: string | null
          id: string
          name_zh: string
          slug: string
          sort_order: number
          subtitle_zh: string | null
        }
        Insert: {
          cover_image_url?: string | null
          id?: string
          name_zh: string
          slug: string
          sort_order?: number
          subtitle_zh?: string | null
        }
        Update: {
          cover_image_url?: string | null
          id?: string
          name_zh?: string
          slug?: string
          sort_order?: number
          subtitle_zh?: string | null
        }
        Relationships: []
      }
      books: {
        Row: {
          author: string | null
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          is_active: boolean
          is_lendable: boolean
          isbn: string | null
          poster_number: number | null
          price_cents: number | null
          procurement_status: string
          stock_qty: number
          title: string
          translator: string | null
          updated_at: string
        }
        Insert: {
          author?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_lendable?: boolean
          isbn?: string | null
          poster_number?: number | null
          price_cents?: number | null
          procurement_status?: string
          stock_qty?: number
          title: string
          translator?: string | null
          updated_at?: string
        }
        Update: {
          author?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_lendable?: boolean
          isbn?: string | null
          poster_number?: number | null
          price_cents?: number | null
          procurement_status?: string
          stock_qty?: number
          title?: string
          translator?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "book_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      borrow_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          book_id: string
          delivery_method: string
          due_at: string | null
          id: string
          picked_up_at: string | null
          requested_at: string
          requester_id: string
          returned_at: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          approved_at?: string | null
          book_id: string
          delivery_method?: string
          due_at?: string | null
          id?: string
          picked_up_at?: string | null
          requested_at?: string
          requester_id: string
          returned_at?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          approved_at?: string | null
          book_id?: string
          delivery_method?: string
          due_at?: string | null
          id?: string
          picked_up_at?: string | null
          requested_at?: string
          requester_id?: string
          returned_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "borrow_requests_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "borrow_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          last_position_seconds: number
          lesson_id: string
          profile_id: string
          updated_at: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          last_position_seconds?: number
          lesson_id: string
          profile_id: string
          updated_at?: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          last_position_seconds?: number
          lesson_id?: string
          profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_progress_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_qa: {
        Row: {
          author_id: string
          body: string
          course_id: string
          created_at: string
          id: string
          is_instructor_reply: boolean
          lesson_id: string | null
          parent_id: string | null
        }
        Insert: {
          author_id: string
          body: string
          course_id: string
          created_at?: string
          id?: string
          is_instructor_reply?: boolean
          lesson_id?: string | null
          parent_id?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          course_id?: string
          created_at?: string
          id?: string
          is_instructor_reply?: boolean
          lesson_id?: string | null
          parent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_qa_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_qa_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_qa_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_qa_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "course_qa"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          instructor_name: string | null
          is_published: boolean
          sort_order: number
          title: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean
          sort_order?: number
          title: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean
          sort_order?: number
          title?: string
        }
        Relationships: []
      }
      group_buys: {
        Row: {
          book_id: string
          closes_at: string | null
          created_at: string
          current_qty: number
          id: string
          status: string
          target_qty: number
        }
        Insert: {
          book_id: string
          closes_at?: string | null
          created_at?: string
          current_qty?: number
          id?: string
          status?: string
          target_qty: number
        }
        Update: {
          book_id?: string
          closes_at?: string | null
          created_at?: string
          current_qty?: number
          id?: string
          status?: string
          target_qty?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_buys_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          course_id: string
          duration_seconds: number | null
          id: string
          is_published: boolean
          sort_order: number
          title: string
          video_url: string | null
        }
        Insert: {
          course_id: string
          duration_seconds?: number | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title: string
          video_url?: string | null
        }
        Update: {
          course_id?: string
          duration_seconds?: number | null
          id?: string
          is_published?: boolean
          sort_order?: number
          title?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          book_id: string | null
          id: string
          order_id: string
          quantity: number
          unit_price_cents: number
        }
        Insert: {
          book_id?: string | null
          id?: string
          order_id: string
          quantity?: number
          unit_price_cents: number
        }
        Update: {
          book_id?: string | null
          id?: string
          order_id?: string
          quantity?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string | null
          created_at: string
          currency: string
          dedication_card_message: string | null
          gift_delivery_method: string | null
          group_buy_id: string | null
          id: string
          notes: string | null
          order_number: string
          order_type: string
          payment_method: string
          payment_received_at: string | null
          recipient_address: string | null
          recipient_email: string | null
          recipient_name: string | null
          status: string
          subtotal_cents: number
          updated_at: string
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          currency?: string
          dedication_card_message?: string | null
          gift_delivery_method?: string | null
          group_buy_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_type?: string
          payment_method?: string
          payment_received_at?: string | null
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          status?: string
          subtotal_cents?: number
          updated_at?: string
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          currency?: string
          dedication_card_message?: string | null
          gift_delivery_method?: string | null
          group_buy_id?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          order_type?: string
          payment_method?: string
          payment_received_at?: string | null
          recipient_address?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          status?: string
          subtotal_cents?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_group_buy_id_fkey"
            columns: ["group_buy_id"]
            isOneToOne: false
            referencedRelation: "group_buys"
            referencedColumns: ["id"]
          },
        ]
      }
      preference_tags: {
        Row: {
          id: string
          label_zh: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          label_zh: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          label_zh?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      profile_preference_tags: {
        Row: {
          created_at: string
          profile_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          profile_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          profile_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_preference_tags_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profile_preference_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "preference_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          locale: string
          phone: string | null
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string
          phone?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reader_questions: {
        Row: {
          admin_response_body: string | null
          created_at: string
          id: string
          is_anonymous: boolean
          question_body: string
          responded_at: string | null
          responded_by: string | null
          status: string
          submitter_display_name: string | null
          submitter_id: string | null
        }
        Insert: {
          admin_response_body?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          question_body: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          submitter_display_name?: string | null
          submitter_id?: string | null
        }
        Update: {
          admin_response_body?: string | null
          created_at?: string
          id?: string
          is_anonymous?: boolean
          question_body?: string
          responded_at?: string | null
          responded_by?: string | null
          status?: string
          submitter_display_name?: string | null
          submitter_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reader_questions_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reader_questions_submitter_id_fkey"
            columns: ["submitter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          book_id: string
          created_at: string
          profile_id: string
        }
        Insert: {
          book_id: string
          created_at?: string
          profile_id: string
        }
        Update: {
          book_id?: string
          created_at?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wishlists_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_answered_questions: {
        Row: {
          admin_response_body: string | null
          created_at: string | null
          id: string | null
          question_body: string | null
          responded_at: string | null
        }
        Insert: {
          admin_response_body?: string | null
          created_at?: string | null
          id?: string | null
          question_body?: string | null
          responded_at?: string | null
        }
        Update: {
          admin_response_body?: string | null
          created_at?: string | null
          id?: string | null
          question_body?: string | null
          responded_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_staff: { Args: { uid: string }; Returns: boolean }
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

