import { notFound } from 'next/navigation'
import { getAlbumById } from '@/lib/albums'
import { AlbumGallery } from '@/components/AlbumGallery'
import { AlbumHero } from '@/components/AlbumHero'

interface AlbumPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { id } = await params
  const album = await getAlbumById(id)

  if (!album) {
    notFound()
  }

  return (
    <div className="min-h-screen">
      <AlbumHero album={album} />
      <AlbumGallery album={album} />
    </div>
  )
}

