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
          full_name: string | null
          avatar_url: string | null
          timezone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      companies: {
        Row: {
          id: string
          name: string
          normalized_name: string
          logo_url: string | null
          website_url: string | null
          location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          normalized_name: string
          logo_url?: string | null
          website_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          normalized_name?: string
          logo_url?: string | null
          website_url?: string | null
          location?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      pipeline_stages: {
        Row: {
          id: string
          user_id: string | null
          name: string
          slug: string
          stage_type: "active" | "closed_won" | "closed_lost"
          position: number
          is_system: boolean
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          slug: string
          stage_type: "active" | "closed_won" | "closed_lost"
          position: number
          is_system?: boolean
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          slug?: string
          stage_type?: "active" | "closed_won" | "closed_lost"
          position?: number
          is_system?: boolean
          is_active?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pipeline_stages_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          id: string
          user_id: string
          company_id: string
          position: string
          location: string | null
          employment_type: string | null
          source: string | null
          job_url: string | null
          salary_min: number | null
          salary_max: number | null
          salary_currency: string | null
          application_date: string
          current_stage_id: string
          status: "Active" | "Offer" | "Accepted" | "Rejected" | "Withdrawn" | "Ghosted" | "Completed"
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          company_id: string
          position: string
          location?: string | null
          employment_type?: string | null
          source?: string | null
          job_url?: string | null
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          application_date?: string
          current_stage_id: string
          status?: "Active" | "Offer" | "Accepted" | "Rejected" | "Withdrawn" | "Ghosted" | "Completed"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          company_id?: string
          position?: string
          location?: string | null
          employment_type?: string | null
          source?: string | null
          job_url?: string | null
          salary_min?: number | null
          salary_max?: number | null
          salary_currency?: string | null
          application_date?: string
          current_stage_id?: string
          status?: "Active" | "Offer" | "Accepted" | "Rejected" | "Withdrawn" | "Ghosted" | "Completed"
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_company_id_fkey"
            columns: ["company_id"]
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_current_stage_id_fkey"
            columns: ["current_stage_id"]
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      application_events: {
        Row: {
          id: string
          application_id: string
          stage_id: string
          event_date: string
          notes: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          application_id: string
          stage_id: string
          event_date?: string
          notes?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          stage_id?: string
          event_date?: string
          notes?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey"
            columns: ["application_id"]
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_events_stage_id_fkey"
            columns: ["stage_id"]
            referencedRelation: "pipeline_stages"
            referencedColumns: ["id"]
          },
        ]
      }
      follow_ups: {
        Row: {
          id: string
          application_id: string
          user_id: string
          title: string
          description: string | null
          due_at: string | null
          status: "Pending" | "Completed" | "Cancelled"
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          user_id: string
          title: string
          description?: string | null
          due_at?: string | null
          status?: "Pending" | "Completed" | "Cancelled"
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          user_id?: string
          title?: string
          description?: string | null
          due_at?: string | null
          status?: "Pending" | "Completed" | "Cancelled"
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "follow_ups_application_id_fkey"
            columns: ["application_id"]
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          id: string
          application_id: string
          interview_type: string | null
          scheduled_at: string
          meeting_url: string | null
          interviewer: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          application_id: string
          interview_type?: string | null
          scheduled_at: string
          meeting_url?: string | null
          interviewer?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          application_id?: string
          interview_type?: string | null
          scheduled_at?: string
          meeting_url?: string | null
          interviewer?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
    }
  }
}
