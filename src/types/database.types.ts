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
      attendance_checkins: {
        Row: {
          checked_in_at: string
          display_name: string
          id: string
          member_id: string | null
          member_type: string
          notes: string | null
          session_id: string
        }
        Insert: {
          checked_in_at?: string
          display_name: string
          id?: string
          member_id?: string | null
          member_type: string
          notes?: string | null
          session_id: string
        }
        Update: {
          checked_in_at?: string
          display_name?: string
          id?: string
          member_id?: string | null
          member_type?: string
          notes?: string | null
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "congregation_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_checkins_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "attendance_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_sessions: {
        Row: {
          congregation_id: string
          created_at: string
          created_by: string | null
          id: string
          service_date: string
        }
        Insert: {
          congregation_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          service_date: string
        }
        Update: {
          congregation_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          service_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "attendance_sessions_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_sessions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      bookable_services: {
        Row: {
          branch_id: string | null
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          branch_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          branch_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "bookable_services_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          approval_status: string
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
          review_notes: string | null
          stock_qty: number
          submitted_by: string | null
          title: string
          translator: string | null
          updated_at: string
        }
        Insert: {
          approval_status?: string
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
          review_notes?: string | null
          stock_qty?: number
          submitted_by?: string | null
          title: string
          translator?: string | null
          updated_at?: string
        }
        Update: {
          approval_status?: string
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
          review_notes?: string | null
          stock_qty?: number
          submitted_by?: string | null
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
          {
            foreignKeyName: "books_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      borrow_requests: {
        Row: {
          admin_notes: string | null
          approved_at: string | null
          book_id: string
          branch_id: string | null
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
          branch_id?: string | null
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
          branch_id?: string | null
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
            foreignKeyName: "borrow_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
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
      branches: {
        Row: {
          address: string | null
          city: string
          created_at: string
          id: string
          is_active: boolean
          is_default: boolean
          sort_order: number
          state: string
          suburb: string
        }
        Insert: {
          address?: string | null
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          sort_order?: number
          state: string
          suburb: string
        }
        Update: {
          address?: string | null
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          is_default?: boolean
          sort_order?: number
          state?: string
          suburb?: string
        }
        Relationships: []
      }
      church_announcements: {
        Row: {
          body_markdown: string
          church_id: string
          created_at: string
          created_by: string | null
          id: string
          published_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body_markdown: string
          church_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body_markdown?: string
          church_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          published_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_announcements_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_announcements_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "public_church_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      church_registrations: {
        Row: {
          church_id: string
          congregation_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          message: string | null
          phone: string | null
          registration_type: string
          status: string
        }
        Insert: {
          church_id: string
          congregation_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          message?: string | null
          phone?: string | null
          registration_type: string
          status?: string
        }
        Update: {
          church_id?: string
          congregation_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          message?: string | null
          phone?: string | null
          registration_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_registrations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_registrations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "public_church_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_registrations_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
        ]
      }
      church_services: {
        Row: {
          church_id: string
          created_at: string
          day_of_week: number | null
          description: string | null
          id: string
          is_active: boolean
          language: string | null
          name_zh: string
          schedule_label: string
          sort_order: number
        }
        Insert: {
          church_id: string
          created_at?: string
          day_of_week?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          language?: string | null
          name_zh: string
          schedule_label: string
          sort_order?: number
        }
        Update: {
          church_id?: string
          created_at?: string
          day_of_week?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          language?: string | null
          name_zh?: string
          schedule_label?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "church_services_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_services_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "public_church_directory"
            referencedColumns: ["id"]
          },
        ]
      }
      church_staff: {
        Row: {
          church_id: string
          created_at: string
          id: string
          profile_id: string
          role: string
        }
        Insert: {
          church_id: string
          created_at?: string
          id?: string
          profile_id: string
          role?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          id?: string
          profile_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "church_staff_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_staff_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "public_church_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "church_staff_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      churches: {
        Row: {
          billing_notes: string | null
          billing_plan_cents: number | null
          billing_status: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_active: boolean
          name_en: string | null
          name_zh: string
          slug: string
          updated_at: string
        }
        Insert: {
          billing_notes?: string | null
          billing_plan_cents?: number | null
          billing_status?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name_en?: string | null
          name_zh: string
          slug: string
          updated_at?: string
        }
        Update: {
          billing_notes?: string | null
          billing_plan_cents?: number | null
          billing_status?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name_en?: string | null
          name_zh?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      congregation_members: {
        Row: {
          congregation_id: string
          created_at: string
          display_name: string
          id: string
          is_active: boolean
          member_type: string
          notes: string | null
          sort_order: number
        }
        Insert: {
          congregation_id: string
          created_at?: string
          display_name: string
          id?: string
          is_active?: boolean
          member_type?: string
          notes?: string | null
          sort_order?: number
        }
        Update: {
          congregation_id?: string
          created_at?: string
          display_name?: string
          id?: string
          is_active?: boolean
          member_type?: string
          notes?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "congregation_members_congregation_id_fkey"
            columns: ["congregation_id"]
            isOneToOne: false
            referencedRelation: "congregations"
            referencedColumns: ["id"]
          },
        ]
      }
      congregations: {
        Row: {
          church_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          service_period: string
          sort_order: number
        }
        Insert: {
          church_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          service_period: string
          sort_order?: number
        }
        Update: {
          church_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          service_period?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "congregations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "congregations_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "public_church_directory"
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
          accreditation_note: string | null
          approval_status: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          instructor_name: string | null
          is_published: boolean
          price_cents: number | null
          program_level: string | null
          review_notes: string | null
          service_category: string
          sort_order: number
          submitted_by: string | null
          term_label: string | null
          title: string
        }
        Insert: {
          accreditation_note?: string | null
          approval_status?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean
          price_cents?: number | null
          program_level?: string | null
          review_notes?: string | null
          service_category?: string
          sort_order?: number
          submitted_by?: string | null
          term_label?: string | null
          title: string
        }
        Update: {
          accreditation_note?: string | null
          approval_status?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          instructor_name?: string | null
          is_published?: boolean
          price_cents?: number | null
          program_level?: string | null
          review_notes?: string | null
          service_category?: string
          sort_order?: number
          submitted_by?: string | null
          term_label?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_books: {
        Row: {
          afterword_markdown: string | null
          author_bio_markdown: string | null
          author_id: string | null
          author_name: string | null
          cover_image_url: string | null
          created_at: string
          declaration_markdown: string | null
          id: string
          preface_markdown: string | null
          slug: string
          status: string
          subtitle: string | null
          title_en: string | null
          title_zh: string
          topic_index: string[]
          updated_at: string
        }
        Insert: {
          afterword_markdown?: string | null
          author_bio_markdown?: string | null
          author_id?: string | null
          author_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          declaration_markdown?: string | null
          id?: string
          preface_markdown?: string | null
          slug: string
          status?: string
          subtitle?: string | null
          title_en?: string | null
          title_zh: string
          topic_index?: string[]
          updated_at?: string
        }
        Update: {
          afterword_markdown?: string | null
          author_bio_markdown?: string | null
          author_id?: string | null
          author_name?: string | null
          cover_image_url?: string | null
          created_at?: string
          declaration_markdown?: string | null
          id?: string
          preface_markdown?: string | null
          slug?: string
          status?: string
          subtitle?: string | null
          title_en?: string | null
          title_zh?: string
          topic_index?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "devotional_books_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_entries: {
        Row: {
          author_id: string | null
          body_markdown: string
          book_id: string
          created_at: string
          entry_number: number
          id: string
          scripture_reference: string | null
          status: string
          subtitle: string | null
          title: string
          updated_at: string
          volume_id: string
          written_date: string | null
        }
        Insert: {
          author_id?: string | null
          body_markdown: string
          book_id: string
          created_at?: string
          entry_number: number
          id?: string
          scripture_reference?: string | null
          status?: string
          subtitle?: string | null
          title: string
          updated_at?: string
          volume_id: string
          written_date?: string | null
        }
        Update: {
          author_id?: string | null
          body_markdown?: string
          book_id?: string
          created_at?: string
          entry_number?: number
          id?: string
          scripture_reference?: string | null
          status?: string
          subtitle?: string | null
          title?: string
          updated_at?: string
          volume_id?: string
          written_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devotional_entries_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_entries_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "devotional_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devotional_entries_volume_id_fkey"
            columns: ["volume_id"]
            isOneToOne: false
            referencedRelation: "devotional_volumes"
            referencedColumns: ["id"]
          },
        ]
      }
      devotional_volumes: {
        Row: {
          book_id: string
          id: string
          intro_markdown: string | null
          sort_order: number
          subtitle_zh: string | null
          title_zh: string
          volume_number: number
        }
        Insert: {
          book_id: string
          id?: string
          intro_markdown?: string | null
          sort_order?: number
          subtitle_zh?: string | null
          title_zh: string
          volume_number: number
        }
        Update: {
          book_id?: string
          id?: string
          intro_markdown?: string | null
          sort_order?: number
          subtitle_zh?: string | null
          title_zh?: string
          volume_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "devotional_volumes_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "devotional_books"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          body_markdown: string | null
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string | null
          id: string
          location: string | null
          poster_image_url: string | null
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          body_markdown?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          id?: string
          location?: string | null
          poster_image_url?: string | null
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          body_markdown?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          id?: string
          location?: string | null
          poster_image_url?: string | null
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          course_id: string | null
          id: string
          order_id: string
          quantity: number
          secondhand_item_id: string | null
          unit_price_cents: number
        }
        Insert: {
          book_id?: string | null
          course_id?: string | null
          id?: string
          order_id: string
          quantity?: number
          secondhand_item_id?: string | null
          unit_price_cents: number
        }
        Update: {
          book_id?: string | null
          course_id?: string | null
          id?: string
          order_id?: string
          quantity?: number
          secondhand_item_id?: string | null
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
            foreignKeyName: "order_items_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_secondhand_item_id_fkey"
            columns: ["secondhand_item_id"]
            isOneToOne: false
            referencedRelation: "secondhand_items"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          branch_id: string | null
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
          branch_id?: string | null
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
          branch_id?: string | null
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
            foreignKeyName: "orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
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
      reading_shares: {
        Row: {
          book_id: string
          created_at: string
          id: string
          is_hidden: boolean
          quote_text: string
          shared_by_name: string | null
          source_group: string | null
          submitted_by: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          quote_text: string
          shared_by_name?: string | null
          source_group?: string | null
          submitted_by: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          quote_text?: string
          shared_by_name?: string | null
          source_group?: string | null
          submitted_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "reading_shares_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reading_shares_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      secondhand_items: {
        Row: {
          author: string | null
          branch_id: string | null
          category_id: string | null
          condition: string
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          price_cents: number
          status: string
          submitted_by: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author?: string | null
          branch_id?: string | null
          category_id?: string | null
          condition: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          price_cents: number
          status?: string
          submitted_by?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author?: string | null
          branch_id?: string | null
          category_id?: string | null
          condition?: string
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          price_cents?: number
          status?: string
          submitted_by?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "secondhand_items_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secondhand_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "book_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "secondhand_items_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          admin_reply_message: string | null
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          party_size: number | null
          preferred_date: string
          preferred_time: string | null
          responded_at: string | null
          responded_by: string | null
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          admin_reply_message?: string | null
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          party_size?: number | null
          preferred_date: string
          preferred_time?: string | null
          responded_at?: string | null
          responded_by?: string | null
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          admin_reply_message?: string | null
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          party_size?: number | null
          preferred_date?: string
          preferred_time?: string | null
          responded_at?: string | null
          responded_by?: string | null
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_responded_by_fkey"
            columns: ["responded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "bookable_services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_material_songs: {
        Row: {
          service_material_id: string
          sort_order: number
          worship_song_id: string
        }
        Insert: {
          service_material_id: string
          sort_order?: number
          worship_song_id: string
        }
        Update: {
          service_material_id?: string
          sort_order?: number
          worship_song_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_material_songs_service_material_id_fkey"
            columns: ["service_material_id"]
            isOneToOne: false
            referencedRelation: "service_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_material_songs_worship_song_id_fkey"
            columns: ["worship_song_id"]
            isOneToOne: false
            referencedRelation: "worship_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      service_materials: {
        Row: {
          church_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          sermon_ppt_url: string | null
          sermon_speaker: string | null
          sermon_title: string | null
          service_date: string
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          church_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          sermon_ppt_url?: string | null
          sermon_speaker?: string | null
          sermon_title?: string | null
          service_date: string
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          church_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          sermon_ppt_url?: string | null
          sermon_speaker?: string | null
          sermon_title?: string | null
          service_date?: string
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_materials_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_materials_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "public_church_directory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_materials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_materials_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "church_services"
            referencedColumns: ["id"]
          },
        ]
      }
      team_applications: {
        Row: {
          admin_notes: string | null
          applicant_id: string | null
          application_type: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          full_name: string
          id: string
          message: string | null
          role_interest: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          applicant_id?: string | null
          application_type: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          full_name: string
          id?: string
          message?: string | null
          role_interest?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          applicant_id?: string | null
          application_type?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          full_name?: string
          id?: string
          message?: string | null
          role_interest?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_contacts: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          imported_by: string | null
          last_broadcast_sent_at: string | null
          last_broadcast_status: string | null
          notes: string | null
          opt_in: boolean
          phone_number: string
          profile_id: string | null
          source: string
          tags: string[]
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          imported_by?: string | null
          last_broadcast_sent_at?: string | null
          last_broadcast_status?: string | null
          notes?: string | null
          opt_in?: boolean
          phone_number: string
          profile_id?: string | null
          source?: string
          tags?: string[]
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          imported_by?: string | null
          last_broadcast_sent_at?: string | null
          last_broadcast_status?: string | null
          notes?: string | null
          opt_in?: boolean
          phone_number?: string
          profile_id?: string | null
          source?: string
          tags?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_contacts_imported_by_fkey"
            columns: ["imported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_contacts_profile_id_fkey"
            columns: ["profile_id"]
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
      worship_songs: {
        Row: {
          church_id: string
          created_at: string
          file_url: string | null
          id: string
          lyrics_markdown: string | null
          title: string
        }
        Insert: {
          church_id: string
          created_at?: string
          file_url?: string | null
          id?: string
          lyrics_markdown?: string | null
          title: string
        }
        Update: {
          church_id?: string
          created_at?: string
          file_url?: string | null
          id?: string
          lyrics_markdown?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "worship_songs_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "churches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worship_songs_church_id_fkey"
            columns: ["church_id"]
            isOneToOne: false
            referencedRelation: "public_church_directory"
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
      public_church_directory: {
        Row: {
          id: string | null
          name_en: string | null
          name_zh: string | null
          slug: string | null
        }
        Insert: {
          id?: string | null
          name_en?: string | null
          name_zh?: string | null
          slug?: string | null
        }
        Update: {
          id?: string | null
          name_en?: string | null
          name_zh?: string | null
          slug?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: { uid: string }; Returns: boolean }
      is_church_staff: {
        Args: { target_church_id: string; uid: string }
        Returns: boolean
      }
      is_partner: { Args: { uid: string }; Returns: boolean }
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

