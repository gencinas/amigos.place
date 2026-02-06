-- Add avatar to profiles
ALTER TABLE profiles ADD COLUMN avatar_url TEXT;

-- Create photos table for accommodation images
CREATE TABLE accommodation_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_accommodation_photos_user_id ON accommodation_photos(user_id);

-- RLS policies for photos
ALTER TABLE accommodation_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Photos are viewable by everyone" ON accommodation_photos
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own photos" ON accommodation_photos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos" ON accommodation_photos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos" ON accommodation_photos
  FOR DELETE USING (auth.uid() = user_id);
