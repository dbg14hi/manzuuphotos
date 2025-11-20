'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'
import { AlbumWithImages } from '@/types'
import { Button } from '@/components/ui/button'
import { InfoModal } from '@/components/InfoModal'
import { Info } from 'lucide-react'
import { getAlbumInfo } from '@/lib/albumInfo'

interface AlbumHeroProps {
  album: AlbumWithImages
}

// Hero section for album detail page with title, description, price, and purchase info
export function AlbumHero({ album }: AlbumHeroProps) {
  const [showInfo, setShowInfo] = useState(false) // Control info modal visibility
  const albumInfo = getAlbumInfo(album.id) // Get hardcoded HTML info for this album

  return (
    <>
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left side - Title and info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-sm uppercase tracking-wide text-blue-400 font-semibold">
                    {album.images.length} photo{album.images.length !== 1 ? 's' : ''}
                  </span>
                  {album.category && (
                    <>
                      <span className="text-gray-500">•</span>
                      <span className="text-sm text-gray-400">{album.category}</span>
                    </>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {album.title}
                </h1>
                {album.description && (
                  <p className="text-lg text-gray-300 max-w-2xl">
                    {album.description}
                  </p>
                )}
              </div>

              {/* Right side - Price and Info button */}
              <div className="flex flex-col items-start md:items-end gap-4">
                <div className="text-3xl font-bold text-blue-400">
                  {formatPrice(album.price_cents)}
                </div>
                <Button
                  onClick={() => setShowInfo(true)}
                  className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white font-semibold"
                >
                  <Info className="mr-2 h-4 w-4" />
                  Kaupa
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <InfoModal
        info={albumInfo || '<p>Aura inn á 780 0446 og svo emailarðu á manni2874@gmail.com með upplýsingum um þig og það sem þú vilt kaupa.</p>'}
        
        isOpen={showInfo}
        onClose={() => setShowInfo(false)}
      />
    </>
  )
}

