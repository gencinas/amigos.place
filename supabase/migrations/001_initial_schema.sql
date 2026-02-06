-- Create custom types
CREATE TYPE accommodation_type AS ENUM ('room', 'sofa', 'other');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled');

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  accommodation_type accommodation_type NOT NULL DEFAULT 'room',
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Availabilities table
CREATE TABLE availabilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_booking_dates CHECK (end_date >= start_date),
  CONSTRAINT no_self_booking CHECK (host_id != guest_id)
);

-- Indexes
CREATE INDEX idx_availabilities_user_id ON availabilities(user_id);
CREATE INDEX idx_availabilities_dates ON availabilities(start_date, end_date);
CREATE INDEX idx_bookings_host_id ON bookings(host_id);
CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_profiles_username ON profiles(username);

-- Updated_at trigger for bookings
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ========================================
-- Row Level Security Policies
-- ========================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- PROFILES policies
CREATE POLICY "Anyone can view profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- AVAILABILITIES policies
CREATE POLICY "Anyone can view availabilities"
  ON availabilities FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own availabilities"
  ON availabilities FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own availabilities"
  ON availabilities FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own availabilities"
  ON availabilities FOR DELETE
  USING (auth.uid() = user_id);

-- BOOKINGS policies
CREATE POLICY "Users can view bookings where they are host or guest"
  ON bookings FOR SELECT
  USING (auth.uid() = host_id OR auth.uid() = guest_id);

CREATE POLICY "Authenticated users can create bookings as guest"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = guest_id);

CREATE POLICY "Hosts can update booking status"
  ON bookings FOR UPDATE
  USING (auth.uid() = host_id);

CREATE POLICY "Guests can cancel their own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = guest_id AND status = 'pending');
