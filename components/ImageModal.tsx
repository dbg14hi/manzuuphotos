'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageModalProps {
  imageUrl: string
  alt: string
  isOpen: boolean
  onClose: () => void
}

export function ImageModal({ imageUrl, alt, isOpen, onClose }: ImageModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 z-10 text-white hover:bg-white/20"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>
      <div className="relative max-w-7xl max-h-full w-full h-full flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={alt}
          width={1920}
          height={1080}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  )
}

