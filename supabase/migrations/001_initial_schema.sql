-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  cover_public_id TEXT NOT NULL,
  price_cents INTEGER NOT NULL CHECK (price_cents > 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_featured BOOLEAN DEFAULT FALSE,
  category TEXT
);

-- Album images table
CREATE TABLE IF NOT EXISTS album_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);


CREATE INDEX IF NOT EXISTS idx_albums_featured ON albums(is_featured) WHERE is_featured = TRUE;
CREATE INDEX IF NOT EXISTS idx_albums_category ON albums(category);
CREATE INDEX IF NOT EXISTS idx_album_images_album ON album_images(album_id);
CREATE INDEX IF NOT EXISTS idx_album_images_position ON album_images(position);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_images ENABLE ROW LEVEL SECURITY;

-- Albums: Public read access
CREATE POLICY "Albums are viewable by everyone" ON albums
  FOR SELECT USING (true);

-- Album images: public read
CREATE POLICY "Album images are viewable by everyone" ON album_images
  FOR SELECT USING (true);

-- Note: For admin operations, you'll use the service role key
-- which bypasses RLS. For production, add proper admin policies.

