// Client-side image compression utility
// Uses browser Canvas API to compress images before upload

export interface CompressionOptions {
  maxWidth?: number // Maximum width in pixels (maintains aspect ratio)
  maxHeight?: number // Maximum height in pixels
  quality?: number // JPEG quality 0-1 (default: 0.85)
  maxSizeMB?: number // Target maximum file size in MB
}

/**
 * Compress an image file using Canvas API
 * @param file Original image file
 * @param options Compression options
 * @returns Compressed File object
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const {
    maxWidth = 3000, // Reasonable max for web (can display 4K)
    maxHeight = 3000,
    quality = 0.85, // Good balance of quality/size
    maxSizeMB = 5, // Target 5MB (well under 10MB limit)
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const img = new Image()
      
      img.onload = () => {
        // Calculate new dimensions maintaining aspect ratio
        let width = img.width
        let height = img.height
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = width * ratio
          height = height * ratio
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'))
          return
        }
        
        // Use high-quality image rendering
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(img, 0, 0, width, height)
        
        // Convert to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Failed to compress image'))
              return
            }
            
            // If still too large, reduce quality further
            const sizeMB = blob.size / (1024 * 1024)
            if (sizeMB > maxSizeMB && quality > 0.5) {
              // Recursively compress with lower quality
              canvas.toBlob(
                (lowerQualityBlob) => {
                  if (!lowerQualityBlob) {
                    // Fallback: use the blob we have
                    const compressedFile = new File([blob], file.name, {
                      type: 'image/jpeg',
                      lastModified: Date.now(),
                    })
                    resolve(compressedFile)
                    return
                  }
                  
                  const compressedFile = new File([lowerQualityBlob], file.name, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                  })
                  resolve(compressedFile)
                },
                'image/jpeg',
                Math.max(0.5, quality - 0.15) // Reduce quality by 0.15, min 0.5
              )
            } else {
              // Size is acceptable
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              })
              resolve(compressedFile)
            }
          },
          'image/jpeg',
          quality
        )
      }
      
      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }
      
      img.src = e.target?.result as string
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Check if an image needs compression
 * @param file Image file to check
 * @param maxSizeMB Maximum size in MB before compression is needed
 * @returns true if compression is recommended
 */
export function shouldCompress(file: File, maxSizeMB: number = 5): boolean {
  const sizeMB = file.size / (1024 * 1024)
  return sizeMB > maxSizeMB
}

