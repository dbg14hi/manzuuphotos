import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/cloudinary'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin, UnauthorizedError } from '@/lib/auth'

// Upload limits and validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file
const MAX_FILES = 50 // Maximum number of files per upload
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

// Validate file size and MIME type
function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `File ${file.name} exceeds maximum size of 10MB`
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return `File ${file.name} has invalid type. Only images are allowed.`
  }
  return null
}

// Sanitize string input by trimming and limiting length
function sanitizeString(input: string, maxLength: number): string {
  return input.trim().slice(0, maxLength)
}

// API route for uploading album with multiple images (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin() // Verify admin authentication

    const formData = await request.formData()
    const files = formData.getAll('files').filter((file): file is File => file instanceof File)
    
    // Validate file count
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'At least one image file is required' },
        { status: 400 }
      )
    }
    if (files.length > MAX_FILES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_FILES} files allowed per upload` },
        { status: 400 }
      )
    }

    // Validate each file (size and type)
    for (const file of files) {
      const validationError = validateFile(file)
      if (validationError) {
        return NextResponse.json(
          { error: validationError },
          { status: 400 }
        )
      }
    }

    // Sanitize and validate text inputs
    const title = sanitizeString((formData.get('title') as string) || '', 200)
    const description = sanitizeString((formData.get('description') as string) || '', 2000)
    const category = sanitizeString((formData.get('category') as string) || '', 100)
    const priceCents = parseInt((formData.get('price_cents') as string) || '0', 10)

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

    // Upload all images to Cloudinary sequentially
    const uploads: { public_id: string }[] = []
    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      const { public_id } = await uploadImage(buffer, 'photography')
      uploads.push({ public_id })
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
        cover_public_id: uploads[0].public_id, // First image is thumbnail
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
    const imagesPayload = uploads.map(({ public_id }, index) => ({
      album_id: (album as { id: string }).id,
      cloudinary_public_id: public_id,
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

