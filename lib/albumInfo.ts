// Hardcoded HTML information for albums (not stored in database)
// Map album IDs to their HTML info content displayed in InfoModal
export const albumInfoMap: Record<string, string> = {
  // Example:
  // 'album-id-here': '<p>Contact me at <a href="mailto:email@example.com">email@example.com</a></p>',
  
  // Add your album IDs and HTML content here
}

// Get hardcoded HTML info for an album by ID
export function getAlbumInfo(albumId: string): string | null {
  return albumInfoMap[albumId] || null
}

