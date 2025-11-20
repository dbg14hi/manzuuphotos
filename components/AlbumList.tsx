'use client'

import { useEffect, useState } from 'react'
import { AlbumWithImages } from '@/types'
import { AlbumCard } from '@/components/AlbumCard'
import { Loader2 } from 'lucide-react'

export function AlbumList() {
  const [albums, setAlbums] = useState<AlbumWithImages[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchAlbums = () => {
    setLoading(true)
    fetch('/api/admin/albums')
      .then((res) => res.json())
      .then((data) => {
        setAlbums(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchAlbums()
  }, [])

  const handleDelete = async (albumId: string) => {
    const confirmed = window.confirm('Delete this album? This cannot be undone.')
    if (!confirmed) return

    setDeletingId(albumId)
    try {
      const response = await fetch(`/api/admin/albums/${albumId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to delete album')
      }

      setAlbums((prev) => prev.filter((album) => album.id !== albumId))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete album. Please try again.'
      alert(message)
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-zinc-400">No albums uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {albums.map((album) => (
        <AlbumCard
          key={album.id}
          album={album}
          onDelete={() => handleDelete(album.id)}
          deleting={deletingId === album.id}
        />
      ))}
    </div>
  )
}

