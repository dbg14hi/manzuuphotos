import { v2 as cloudinary } from 'cloudinary'

// Initialize Cloudinary with credentials from environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export { cloudinary }

// Type definition for Cloudinary transformation parameters
type CloudinaryTransformation = {
  width?: number
  height?: number
  crop?: string
  quality?: string
  format?: string
  overlay?: string
  opacity?: number
  gravity?: string
}

// Generate a preview URL with full resolution and optional watermark
export function getPreviewUrl(publicId: string, useWatermark: boolean = true): string {
  const transformations: CloudinaryTransformation[] = [
    {
      quality: 'auto:best', // Use best quality, no size restrictions
      format: 'auto', // Auto-format based on browser support
    },
  ]

  // Check if watermark is configured and should be applied
  const watermarkId = process.env.CLOUDINARY_WATERMARK_ID
  const watermarkEnabled =
    watermarkId &&
    watermarkId.trim().length > 0 &&
    watermarkId !== 'your_watermark_id'

  if (useWatermark && watermarkEnabled) {
    // Add watermark overlay centered with 30% opacity
    transformations.push({
      overlay: watermarkId, // Public ID of watermark image in Cloudinary
      opacity: 60,
      gravity: 'center',
    })
  }

  return cloudinary.url(publicId, {
    transformation: transformations,
    type: 'upload',
    resource_type: 'image',
    secure: true,
  })
}

// Delete image from Cloudinary by public ID
export async function deleteImage(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: 'image' }, (error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

// Delete multiple images from Cloudinary
export async function deleteImages(publicIds: string[]): Promise<void> {
  await Promise.all(publicIds.map((publicId) => deleteImage(publicId).catch((error) => {
    // Log error but don't fail entire operation if one image fails to delete
    console.error(`Failed to delete image ${publicId}:`, error)
  })))
}

