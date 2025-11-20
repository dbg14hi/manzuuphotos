'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AlbumWithImages } from '@/types'
import { ImageModal } from '@/components/ImageModal'

interface AlbumGalleryProps {
  album: AlbumWithImages
}

interface ImageDimensions {
  width: number
  height: number
}

interface JustifiedImage {
  id: string
  preview_url: string
  aspect: number
}

interface JustifiedRow {
  images: JustifiedImage[]
  height: number
}

export function AlbumGallery({ album }: AlbumGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageDimensions, setImageDimensions] = useState<Map<string, ImageDimensions>>(new Map())
  const [rowHeight, setRowHeight] = useState<number>(300) // Base row height for justified layout
  const [containerWidth, setContainerWidth] = useState<number>(0)

  const containerRef = useRef<HTMLDivElement>(null)

  // Adjust row height based on screen width for responsive layout
  useEffect(() => {
    const updateRowHeight = () => {
      const w = window.innerWidth
      if (w < 500) setRowHeight(150) // Mobile
      else if (w < 900) setRowHeight(210) // Tablet
      else setRowHeight(300) // Desktop
    }

    updateRowHeight()
    window.addEventListener('resize', updateRowHeight)
    return () => window.removeEventListener('resize', updateRowHeight)
  }, [])

  // Load natural dimensions of all images to calculate aspect ratios
  useEffect(() => {
    const loadDimensions = async () => {
      const dimensions = new Map<string, ImageDimensions>()

      // Load all images in parallel to get their natural dimensions
      await Promise.all(
        album.images.map((image) => {
          return new Promise<void>((resolve) => {
            const img = new window.Image()
            img.onload = () => {
              dimensions.set(image.id, {
                width: img.naturalWidth,
                height: img.naturalHeight,
              })
              resolve()
            }
            img.onerror = () => resolve() // Continue even if image fails to load
            img.src = image.preview_url
          })
        })
      )

      setImageDimensions(dimensions)
    }

    loadDimensions()
  }, [album.images])

  // Track container width changes for responsive layout calculations
  useEffect(() => {
    if (!containerRef.current) return

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width)
      }
    })

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Build justified rows: pack images into rows that fill container width
  const buildRows = (): JustifiedRow[] => {
    if (containerWidth === 0) return []

    const rows: JustifiedRow[] = []
    let currentRow: JustifiedImage[] = []
    let aspectSum = 0 // Sum of aspect ratios for current row

    for (const img of album.images) {
      const dims = imageDimensions.get(img.id)
      if (!dims) continue // Skip if dimensions not loaded yet

      const aspect = dims.width / dims.height
      const justifiedImg: JustifiedImage = {
        id: img.id,
        preview_url: img.preview_url,
        aspect,
      }

      currentRow.push(justifiedImg)
      aspectSum += aspect

      // Check if adding this image would exceed container width
      const expectedWidth = aspectSum * rowHeight
      if (expectedWidth >= containerWidth) {
        // Calculate actual height to fill container width exactly
        const finalHeight = containerWidth / aspectSum
        rows.push({ images: currentRow, height: finalHeight })

        currentRow = []
        aspectSum = 0
      }
    }

    // Add remaining images as final row with default height
    if (currentRow.length > 0) {
      rows.push({ images: currentRow, height: rowHeight })
    }

    return rows
  }

  const rows = buildRows()

  return (
    <>
      <div className="w-full px-2 md:px-4 py-12">
        <div ref={containerRef} className="w-full max-w-[1500px] mx-auto">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2 mb-2">
              {row.images.map((img) => {
                const width = img.aspect * row.height
                return (
                  <div
                    key={img.id}
                    onClick={() => setSelectedImage(img.preview_url)}
                    className="relative overflow-hidden cursor-pointer"
                    style={{
                      height: row.height,
                      width,
                      flexShrink: 0,
                    }}
                  >
                    <Image
                      src={img.preview_url}
                      alt={`${album.title} image`}
                      fill
                      className="object-cover"
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      <ImageModal
        imageUrl={selectedImage || ''}
        alt={album.title}
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </>
  )
}
