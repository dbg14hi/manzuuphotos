'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InfoModalProps {
  info: string
  isOpen: boolean
  onClose: () => void
}

// Modal displaying hardcoded HTML information about how to purchase an album
export function InfoModal({ info, isOpen, onClose }: InfoModalProps) {
  // Lock body scroll when modal is open
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
      onClick={onClose} // Close on background click
    >
      <div
        className="relative max-w-2xl w-full bg-zinc-900 rounded-lg border border-zinc-700 p-6 md:p-8"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking content
      >
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-white hover:bg-white/20"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
        <h2 className="text-2xl font-bold text-white mb-4">How to Get This Album</h2>
        {/* Render HTML content from hardcoded album info */}
        <div 
          className="text-white/90 leading-relaxed prose prose-invert prose-headings:text-white prose-p:text-white/90 prose-a:text-cyan-400 prose-a:hover:text-cyan-300 prose-strong:text-white prose-ul:text-white/90 prose-ol:text-white/90"
          dangerouslySetInnerHTML={{ __html: info }}
        />
      </div>
    </div>
  )
}

