import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPreviewUrl } from '@/lib/cloudinary'
import { requireAdmin, UnauthorizedError } from '@/lib/auth'

export async function GET() {
  try {
    // Check authentication - throws UnauthorizedError if not admin
    await requireAdmin()
    
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('albums')
      .select('*, album_images(*)')
      .order('created_at', { ascending: false })
      .order('position', { referencedTable: 'album_images', ascending: true })

    if (error || !data) {
      return NextResponse.json(
        { error: 'Failed to fetch albums' },
        { status: 500 }
      )
    }

    const albums = data.map((album) => {
      const albumData = album as {
        cover_public_id: string
        album_images?: Array<{ id: string; cloudinary_public_id: string; position: number | null }>
        [key: string]: unknown
      }
      
      const images = (albumData.album_images || []).map((image) => ({
        id: image.id,
        cloudinary_public_id: image.cloudinary_public_id,
        position: image.position,
        preview_url: getPreviewUrl(image.cloudinary_public_id, true),
      }))

      return {
        ...albumData,
        preview_url: getPreviewUrl(albumData.cover_public_id, true),
        images,
      }
    })

    return NextResponse.json(albums)
  } catch (error) {
    // Handle authentication errors separately
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.error('Failed to fetch albums:', error)
    return NextResponse.json(
      { error: 'Failed to fetch albums' },
      { status: 500 }
    )
  }
}

