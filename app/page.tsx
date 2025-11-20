import { getAlbums } from '@/lib/albums'
import { AlbumCard } from '@/components/AlbumCard'
import { CameraHero } from '@/components/CameraHero'

export default async function Home() {
  const albums = await getAlbums(false)

  return (
    <>
      <CameraHero />
      <section id="albums-section" className="relative w-full py-16 z-10 min-h-screen" style={{ marginTop: '100vh', position: 'relative' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-900 via-zinc-800 to-black -z-10" />

        {albums.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 text-lg">
              No albums available yet. Check back soon!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 w-[80%] mx-auto">
            {albums.map((album) => (
              <AlbumCard key={album.id} album={album} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
