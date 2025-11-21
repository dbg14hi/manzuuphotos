import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, UnauthorizedError } from '@/lib/auth'
import { deleteImages } from '@/lib/cloudinary'

interface RouteContext {
  params: Promise<{
    id: string
  }>
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Check authentication - throws if not admin
    await requireAdmin()

    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ error: 'Album ID is required' }, { status: 400 })
    }

    const adminSupabase = createAdminClient()

    // First, fetch album and all its images to get Cloudinary public_ids
    type AlbumRow = {
      id: string
      cover_public_id: string
    }

    type AlbumImageRow = {
      cloudinary_public_id: string
    }

    // Fetch album separately to avoid type issues with nested selects
    // Type assertions needed because Supabase admin client types don't infer correctly
    const albumQuery = adminSupabase.from('albums').select('id, cover_public_id').eq('id', id).single()
    const albumResult = (await albumQuery) as { data: AlbumRow | null; error: unknown }

    if (albumResult.error || !albumResult.data) {
      console.error('Error fetching album:', albumResult.error)
      return NextResponse.json(
        { error: 'Album not found' },
        { status: 404 }
      )
    }

    const album = albumResult.data

    // Fetch album images separately
    const imagesQuery = adminSupabase.from('album_images').select('cloudinary_public_id').eq('album_id', id)
    const imagesResult = (await imagesQuery) as { data: AlbumImageRow[] | null; error: unknown }

    const albumImages = imagesResult.data || []

    // Collect all public_ids to delete from Cloudinary
    const publicIds: string[] = []
    
    // Add cover image public_id
    if (album.cover_public_id) {
      publicIds.push(album.cover_public_id)
    }

    // Add all album image public_ids
    albumImages.forEach((img) => {
      if (img.cloudinary_public_id && !publicIds.includes(img.cloudinary_public_id)) {
        // Avoid duplicates (cover might be in album_images too)
        publicIds.push(img.cloudinary_public_id)
      }
    })

    // Delete all images from Cloudinary
    if (publicIds.length > 0) {
      await deleteImages(publicIds)
    }

    // Now delete album from database (album_images will be deleted via CASCADE)
    const { error } = await adminSupabase
      .from('albums')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting album from database:', error)
      return NextResponse.json(
        { error: 'Failed to delete album from database' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    // Handle authentication errors separately
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const message = error instanceof Error ? error.message : 'Failed to delete album'
    console.error('Delete album error:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

