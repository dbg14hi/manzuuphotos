import Link from 'next/link'
import Image from 'next/image'
import { Card } from '@/components/ui/card'
import { formatPrice } from '@/lib/utils'
import { AlbumWithImages } from '@/types'

interface AlbumCardProps {
  album: AlbumWithImages
  onDelete?: () => void
  deleting?: boolean
}

// Album card component for homepage gallery with hover overlay
export function AlbumCard({ album, onDelete, deleting }: AlbumCardProps) {
  return (
    <Link href={`/albums/${album.id}`}>
      <Card className="group relative overflow-hidden transition-all cursor-pointer bg-zinc-900/50 border-0 backdrop-blur-sm w-full rounded-none">
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-800">
          <Image
            src={album.preview_url}
            alt={album.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            quality={90}
            priority // Prioritize loading for above-the-fold images
          />
          {/* Delete button (only shown in admin dashboard) */}
          {onDelete && (
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault() // Prevent navigation
                event.stopPropagation() // Prevent card click
                onDelete()
              }}
              disabled={deleting}
              className="absolute top-2 right-2 z-10 bg-white/90 text-xs font-semibold text-red-600 px-2 py-1 rounded-md shadow-sm hover:bg-red-50 disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
          {/* Hover overlay showing album info */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center text-white px-6">
              <h3 className="font-bold text-2xl mb-2">
                {album.title}
              </h3>
              {album.description && (
                <p className="text-sm mb-3 line-clamp-2">
                  {album.description}
                </p>
              )}
              <div className="flex items-center justify-center gap-4">
                <p className="text-lg font-semibold">
                  {formatPrice(album.price_cents)}
                </p>
                <span className="text-sm">
                  {album.images.length} photo{album.images.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  )
}

