import { Database } from './database'

export type Album = Database['public']['Tables']['albums']['Row']
export type AlbumImage = Database['public']['Tables']['album_images']['Row']

export interface AlbumWithImages extends Album {
  preview_url: string
  images: Array<{
    id: string
    cloudinary_public_id: string
    position: number
    preview_url: string
  }>
}

