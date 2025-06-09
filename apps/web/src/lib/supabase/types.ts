/* ─────────────────────────────────────────────
   Supabase generated types - manual extension
───────────────────────────────────────────── */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      /* ───────── users ───────── */
      users: {
        Row: {
          id: string;              // uuid
          email: string;
          created_at: string | null; // timestamptz
        };
        Insert: {
          id: string;
          email: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string | null;
        };
      };

      /* ───────── documents ───────── */
      documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          mime_type: string;
          storage_path: string;
          uploaded_at: string | null;
          vector_embedding: number[] | null;   // pgvector
          type_enum: string | null;
          title: string | null;
          expiry_date: string | null;
          classify_confidence: number | null;
          is_indexed: boolean | null;
          file_size?: number | null;           // optional - if you added it
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          mime_type: string;
          storage_path: string;
          uploaded_at?: string | null;
          vector_embedding?: number[] | null;
          type_enum?: string | null;
          title?: string | null;
          expiry_date?: string | null;
          classify_confidence?: number | null;
          is_indexed?: boolean | null;
          file_size?: number | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          mime_type?: string;
          storage_path?: string;
          uploaded_at?: string | null;
          vector_embedding?: number[] | null;
          type_enum?: string | null;
          title?: string | null;
          expiry_date?: string | null;
          classify_confidence?: number | null;
          is_indexed?: boolean | null;
          file_size?: number | null;
        };
      };

      /* ───────── doc_fields ───────── */
      doc_fields: {
        Row: {
          id: string;
          document_id: string;
          field_name: string | null;
          field_value: string | null;
          confidence: number | null;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          document_id: string;
          field_name?: string | null;
          field_value?: string | null;
          confidence?: number | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          document_id?: string;
          field_name?: string | null;
          field_value?: string | null;
          confidence?: number | null;
          created_at?: string | null;
        };
      };

      /* ───────── notifications ───────── */
      notifications: {
        Row: {
          id: string;
          user_id: string;
          document_id: string;
          title: string;
          expires_at: string;           // timestamptz
          is_read: boolean | null;
          created_at: string | null;    // timestamptz
        };
        Insert: {
          id?: string;
          user_id: string;
          document_id: string;
          title: string;
          expires_at: string;
          is_read?: boolean | null;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          document_id?: string;
          title?: string;
          expires_at?: string;
          is_read?: boolean | null;
          created_at?: string | null;
        };
      };
    };

    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};
