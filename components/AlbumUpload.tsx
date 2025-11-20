'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, ImageIcon } from 'lucide-react'

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
  const [error, setError] = useState('')

  // Handle file selection and generate preview thumbnails
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length === 0) {
      return
    }

    setFiles(selectedFiles)
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (files.length === 0 || !title || !price) {
      setError('Please provide album title, price, and at least one image.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      files.forEach((file) => formData.append('files', file))
      formData.append('title', title)
      formData.append('description', description)
      formData.append('category', category)
      formData.append('price_cents', (parseFloat(price) * 100).toString()) // Convert to cents

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setFiles([])
      setPreviews([])
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
        </label>
        <div className="mt-1 space-y-4">
          {previews.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {previews.map((preview, index) => (
                <div key={index} className="relative rounded-lg overflow-hidden border-2 border-zinc-600">
                  <img src={preview} alt={`Preview ${index + 1}`} className="h-32 w-full object-cover" />
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-gradient-to-r from-cyan-500 to-purple-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      Thumbnail
                    </span>
                  )}
                </div>
              ))}
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

