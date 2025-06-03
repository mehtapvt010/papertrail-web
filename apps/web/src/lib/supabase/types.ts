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
      users: {
        Row: {
          id: string; // uuid
          email: string;
          created_at: string | null; // timestamp with time zone
        };
        Insert: {
          id: string; // must match auth.users uuid
          email: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          created_at?: string | null;
        };
      };

      documents: {
        Row: {
          id: string;
          user_id: string;
          file_name: string;
          mime_type: string;
          storage_path: string;
          uploaded_at: string | null;
          vector_embedding: number[] | null; // pgvector
        };
        Insert: {
          id?: string;
          user_id: string;
          file_name: string;
          mime_type: string;
          storage_path: string;
          uploaded_at?: string | null;
          vector_embedding?: number[] | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_name?: string;
          mime_type?: string;
          storage_path?: string;
          uploaded_at?: string | null;
          vector_embedding?: number[] | null;
        };
      };

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
    };

    Views: Record<string, never>; // No views yet
    Functions: Record<string, never>; // No functions yet
  };
};
