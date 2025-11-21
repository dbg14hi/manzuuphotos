'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, ImageIcon } from 'lucide-react'
import { uploadToCloudinary } from '@/lib/cloudinary-upload'

interface AlbumUploadProps {
  onSuccess?: () => void
}

export function AlbumUpload({ onSuccess }: AlbumUploadProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({})
  const [error, setError] = useState('')

  // File size limits - files upload directly to Cloudinary (bypasses Vercel limit)
  const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB per file (Cloudinary free tier limit)
  const MAX_FILES = 50 // Maximum number of files per upload

  // Handle file selection and generate preview thumbnails
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) {
      return
    }

    // Validate file count
    if (selectedFiles.length > MAX_FILES) {
      setError(`Maximum ${MAX_FILES} files allowed per upload`)
      return
    }

    // Validate file sizes before accepting
    const invalidFiles: string[] = []

    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        invalidFiles.push(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`)
      }
    }

    if (invalidFiles.length > 0) {
      setError(
        `Some files are too large (max ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB per file): ${invalidFiles.join(', ')}`
      )
      return
    }

    setError('') // Clear any previous errors
    setFiles(selectedFiles)
    setUploadProgress({}) // Reset upload progress
    // Generate data URLs for preview thumbnails
    Promise.all(
      selectedFiles.map(
        (file) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })
      )
    ).then(setPreviews)
  }

  // Submit album with images to API
  // Files are uploaded directly to Cloudinary from browser to bypass Vercel's 4.5MB limit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0 || !title || !price) {
      setError('Please provide album title, price, and at least one image.')
      return
    }

    setLoading(true)
    setError('')
    setUploadProgress({})

    try {
      // Upload all files directly to Cloudinary (bypasses Vercel)
      const publicIds: string[] = []
      
      await Promise.all(
        files.map(async (file, index) => {
          try {
            const result = await uploadToCloudinary(file, 'photography', (progress) => {
              setUploadProgress((prev) => ({ ...prev, [index]: progress }))
            })
            publicIds.push(result.public_id)
          } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Upload failed'
            throw new Error(`Failed to upload ${file.name}: ${errorMsg}`)
          }
        })
      )

      // Send album metadata and public_ids to API (small payload, no files)
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_ids: publicIds,
          title,
          description,
          category,
          price_cents: Math.round(parseFloat(price) * 100), // Convert to cents
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to create album'
        try {
          const data = await response.json()
          errorMessage = data.error || errorMessage
        } catch {
          // If response is not JSON, try to get text
          try {
            const text = await response.text()
            if (text) {
              errorMessage = `Failed to create album: ${text.substring(0, 100)}`
            }
          } catch {
            // Fall back to default message
          }
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Reset form
      setFiles([])
      setPreviews([])
      setUploadProgress({})
      setTitle('')
      setDescription('')
      setCategory('')
      setPrice('')

      onSuccess?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
    } finally {
      setLoading(false)
      setUploadProgress({})
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Album Images * (first image becomes thumbnail)
          <span className="text-xs text-zinc-400 ml-2 font-normal">
            (Max {MAX_FILE_SIZE / 1024 / 1024}MB per file, up to {MAX_FILES} files)
          </span>
        </label>
        <div className="mt-1 space-y-4">
          {previews.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {previews.map((preview, index) => {
                const progress = uploadProgress[index]
                const isUploading = loading && progress !== undefined
                return (
                  <div key={index} className="relative rounded-lg overflow-hidden border-2 border-zinc-600">
                    <img src={preview} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover" />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                        Thumbnail
                      </span>
                    )}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="text-center">
                          <Loader2 className="mx-auto h-6 w-6 animate-spin text-white mb-1" />
                          <span className="text-xs text-white">{Math.round(progress || 0)}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-32 border-2 border-dashed border-zinc-600 rounded-lg text-zinc-400 bg-zinc-900/30">
              <div className="text-center">
                <ImageIcon className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">Upload one or more images</p>
              </div>
            </div>
          )}

          <label className="cursor-pointer inline-flex">
            <div className="flex items-center justify-center px-4 py-2 border-2 border-zinc-600 rounded-lg hover:bg-zinc-700/50 transition-colors text-white font-medium">
              <Upload className="h-5 w-5 mr-2" />
              Choose Files
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
          Album Title *
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          placeholder="Enter album title"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all resize-none"
          placeholder="Enter album description (optional)"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-white mb-2">
          Category
        </label>
        <input
          id="category"
          type="text"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          placeholder="Enter category (optional)"
        />
      </div>

      <div>
        <label htmlFor="price" className="block text-sm font-medium text-white mb-2">
          Price (ISK) *
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          min="0"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="w-full px-4 py-3 bg-zinc-900/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
          placeholder="0.00"
        />
      </div>

      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold py-3"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : (
          'Upload Album'
        )}
      </Button>
    </form>
  )
}

