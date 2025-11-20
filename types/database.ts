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
      albums: {
        Row: {
          id: string
          title: string
          description: string | null
          cover_public_id: string
          price_cents: number
          created_at: string
          updated_at: string
          is_featured: boolean
          category: string | null
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          cover_public_id: string
          price_cents: number
          created_at?: string
          updated_at?: string
          is_featured?: boolean
          category?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          cover_public_id?: string
          price_cents?: number
          created_at?: string
          updated_at?: string
          is_featured?: boolean
          category?: string | null
        }
      }
      album_images: {
        Row: {
          id: string
          album_id: string
          cloudinary_public_id: string
          position: number
          created_at: string
        }
        Insert: {
          id?: string
          album_id: string
          cloudinary_public_id: string
          position?: number
          created_at?: string
        }
        Update: {
          id?: string
          album_id?: string
          cloudinary_public_id?: string
          position?: number
          created_at?: string
        }
      }
    }
  }
}

