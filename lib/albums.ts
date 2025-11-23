import { createClient } from '@/lib/supabase/server'
import { getPreviewUrl } from '@/lib/cloudinary'
import { Album, AlbumWithImages, AlbumImage } from '@/types'

// Type for album with nested images from Supabase
type AlbumRow = Album & { album_images?: AlbumImage[] }

// Convert database album row to AlbumWithImages with preview URLs
function serializeAlbum(album: AlbumRow): AlbumWithImages {
  // Sort images by position to maintain upload order
  const sortedImages = (album.album_images || []).sort(
    (a, b) => (a.position || 0) - (b.position || 0)
  )

  return {
    ...album,
    preview_url: getPreviewUrl(album.cover_public_id, true), // Full resolution with watermark
    images: sortedImages.map((image) => ({
      id: image.id,
      cloudinary_public_id: image.cloudinary_public_id,
      position: image.position,
      preview_url: getPreviewUrl(image.cloudinary_public_id, true), // Full resolution with watermark
    })),
  }
}

// Fetch all albums from database, optionally filter by featured
export async function getAlbums(featuredOnly: boolean = false): Promise<AlbumWithImages[]> {
  try {
    const supabase = await createClient()

    let query = supabase
      .from('albums')
      .select('*, album_images(*)') // Join album_images table
      .order('created_at', { ascending: false }) // Newest first
      .order('position', { referencedTable: 'album_images', ascending: true }) // Images in position order

    if (featuredOnly) {
      query = query.eq('is_featured', true)
    }

    const { data, error } = await query

    if (error || !data) {
      // Don't log auth-related errors (refresh token issues) as they're expected when not logged in
      if (error && !error.message?.includes('refresh_token') && !error.message?.includes('Refresh Token')) {
        console.error('Error fetching albums:', error)
      }
      return []
    }

    return data.map((album) => serializeAlbum(album as AlbumRow))
  } catch (error) {
    // Catch any errors during client creation (like refresh token errors)
    // These are expected when users aren't logged in and shouldn't break the page
    if (error instanceof Error) {
      // Only log non-auth errors
      if (!error.message.includes('refresh_token') && 
          !error.message.includes('Refresh Token') &&
          !error.message.includes('AuthApiError')) {
        console.error('Unexpected error fetching albums:', error.message)
      }
    }
    return []
  }
}

// Fetch a single album by ID with all its images
export async function getAlbumById(id: string): Promise<AlbumWithImages | null> {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('albums')
      .select('*, album_images(*)')
      .eq('id', id)
      .order('position', { referencedTable: 'album_images', ascending: true })
      .single()

    if (error || !data) {
      // Don't log auth-related errors (refresh token issues) as they're expected when not logged in
      if (error && !error.message?.includes('refresh_token') && !error.message?.includes('Refresh Token')) {
        console.error('Error fetching album:', error)
      }
      return null
    }

    return serializeAlbum(data as AlbumRow)
  } catch (error) {
    // Catch any errors during client creation (like refresh token errors)
    // These are expected when users aren't logged in and shouldn't break the page
    if (error instanceof Error) {
      // Only log non-auth errors
      if (!error.message.includes('refresh_token') && 
          !error.message.includes('Refresh Token') &&
          !error.message.includes('AuthApiError')) {
        console.error('Unexpected error fetching album:', error.message)
      }
    }
    return null
  }
}

