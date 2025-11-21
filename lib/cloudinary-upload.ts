// Client-side Cloudinary upload utility for direct browser uploads
// This bypasses Vercel's 4.5MB payload limit by uploading directly to Cloudinary

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
}

// Upload file directly to Cloudinary from browser (bypasses server)
export async function uploadToCloudinary(
  file: File,
  folder: string = 'photography',
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME) {
    throw new Error('Cloudinary cloud name is not configured')
  }
  if (!UPLOAD_PRESET) {
    throw new Error('Cloudinary upload preset is not configured')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100
          onProgress(progress)
        }
      })
    }

    // Handle completion
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const result = JSON.parse(xhr.responseText)
          if (result.error) {
            reject(new Error(result.error.message || 'Upload failed'))
          } else {
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
              width: result.width || 0,
              height: result.height || 0,
            })
          }
        } catch (error) {
          reject(new Error('Failed to parse upload response'))
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText)
          reject(new Error(error.error?.message || `Upload failed with status ${xhr.status}`))
        } catch {
          reject(new Error(`Upload failed with status ${xhr.status}`))
        }
      }
    })

    // Handle errors
    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'))
    })

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload was aborted'))
    })

    // Start upload
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`)
    xhr.send(formData)
  })
}

