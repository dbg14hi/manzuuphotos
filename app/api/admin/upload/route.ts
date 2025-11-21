import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, UnauthorizedError } from '@/lib/auth'

// Upload limits and validation constants
// Files are now uploaded directly to Cloudinary from browser, so we can accept larger files
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file (Cloudinary free tier allows up to 10MB)
const MAX_FILES = 50 // Maximum number of files per upload

// Sanitize string input by trimming and limiting length
function sanitizeString(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength)
}

// API route for creating album with images that were already uploaded to Cloudinary
// Files are uploaded directly from browser to Cloudinary to bypass Vercel's 4.5MB limit
export async function POST(request: NextRequest) {
  try {
    await requireAdmin() // Verify admin authentication

    const body = await request.json()
    
    // Validate that public_ids array is provided
    const publicIds: string[] = body.public_ids || []
    if (publicIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one image is required' },
        { status: 400 }
      )
    }
    if (publicIds.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} images allowed per album` },
        { status: 400 }
      )
    }

    // Sanitize and validate text inputs
    const title = sanitizeString(body.title || '', 200)
    const description = sanitizeString(body.description || '', 2000)
    const category = sanitizeString(body.category || '', 100)
    const priceCents = parseInt(body.price_cents || '0', 10)

    if (!title || title.length === 0) {
      return NextResponse.json(
        { error: 'Album title is required' },
        { status: 400 }
      )
    }

    if (Number.isNaN(priceCents) || priceCents <= 0) {
      return NextResponse.json(
        { error: 'Valid price is required (must be greater than 0)' },
        { status: 400 }
      )
    }

    // Create album record in database (first image becomes cover/thumbnail)
    const adminSupabase = createAdminClient()
    const { data: album, error } = await adminSupabase
      .from('albums')
      // @ts-expect-error - Supabase type inference issue: albums table exists but types aren't inferred correctly
      .insert({
        title,
        description: description || null,
        category: category || null,
        cover_public_id: publicIds[0], // First image is thumbnail
        price_cents: priceCents,
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving album:', error)
      return NextResponse.json(
        { error: 'Failed to save album' },
        { status: 500 }
      )
    }

    if (!album || !('id' in album)) {
      return NextResponse.json(
        { error: 'Failed to save album' },
        { status: 500 }
      )
    }

    // Create album_images records with position order
    const imagesPayload = publicIds.map((publicId, index) => ({
      album_id: (album as { id: string }).id,
      cloudinary_public_id: publicId,
      position: index, // Maintain upload order
    }))

    const { error: imagesError } = await adminSupabase
      .from('album_images')
      // @ts-expect-error - Supabase type inference issue: album_images table exists but types aren't inferred correctly
      .insert(imagesPayload)

    if (imagesError) {
      console.error('Error saving album images:', imagesError)
      return NextResponse.json(
        { error: 'Failed to save album images' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, album })
  } catch (error) {
    // Handle authentication errors separately
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const message = error instanceof Error ? error.message : 'Upload failed'
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
}

