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
      opacity: 30,
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

// Upload image file to Cloudinary and return public ID and secure URL
export async function uploadImage(
  file: File | Buffer,
  folder: string = 'photography'
): Promise<{ public_id: string; secure_url: string }> {
  return new Promise(async (resolve, reject) => {
    try {
      // Convert File to Buffer if needed
      let buffer: Buffer
      if (file instanceof File) {
        const arrayBuffer = await file.arrayBuffer()
        buffer = Buffer.from(arrayBuffer)
      } else {
        buffer = file
      }

      // Upload stream with best quality settings
      cloudinary.uploader.upload_stream(
        {
          folder, // Organize images in folder
          resource_type: 'image',
          type: 'upload',
          access_mode: 'public', // Make images publicly accessible
          quality: 'auto:best', // Upload at best quality
          eager: [], // Don't generate transformations on upload
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else if (result) {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
            })
          } else {
            reject(new Error('Upload failed'))
          }
        }
      ).end(buffer)
    } catch (error) {
      reject(error)
    }
  })
}

