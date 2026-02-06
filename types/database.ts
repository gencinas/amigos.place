/*
  SQL migration for new fields:

  ALTER TABLE profiles
    ADD COLUMN IF NOT EXISTS intent text CHECK (intent IN ('host', 'guest', 'both')),
    ADD COLUMN IF NOT EXISTS default_payment_type text CHECK (default_payment_type IN ('free', 'friend_price', 'favor', 'service')),
    ADD COLUMN IF NOT EXISTS default_price numeric,
    ADD COLUMN IF NOT EXISTS default_favor_text text,
    ADD COLUMN IF NOT EXISTS default_presence text CHECK (default_presence IN ('home', 'empty', 'shared')),
    ADD COLUMN IF NOT EXISTS onboarding_step integer DEFAULT 0;

  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_accommodation_type_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_accommodation_type_check
    CHECK (accommodation_type IN ('room', 'sofa', 'airbed', 'other'));
*/

export type AccommodationType = 'room' | 'sofa' | 'airbed' | 'other'
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'
export type AccommodationStatus = 'empty' | 'host_present' | 'shared'
export type PaymentType = 'free' | 'friend_price' | 'favor' | 'service'
export type Intent = 'host' | 'guest' | 'both'
export type Presence = 'home' | 'empty' | 'shared'

export interface Profile {
  id: string
  username: string
  display_name: string
  city: string
  country: string
  accommodation_type: AccommodationType
  bio: string | null
  avatar_url: string | null
  intent: Intent | null
  default_payment_type: PaymentType | null
  default_price: number | null
  default_favor_text: string | null
  default_presence: Presence | null
  onboarding_step: number | null
  created_at: string
}

export interface AccommodationPhoto {
  id: string
  user_id: string
  photo_url: string
  display_order: number
  caption: string | null
  created_at: string
}

export interface Availability {
  id: string
  user_id: string
  start_date: string
  end_date: string
  notes: string | null
  accommodation_status: AccommodationStatus | null
  payment_type: PaymentType | null
  price_amount: number | null
  price_currency: string
  favor_description: string | null
  created_at: string
}

export interface Booking {
  id: string
  host_id: string
  guest_id: string
  start_date: string
  end_date: string
  status: BookingStatus
  message: string
  created_at: string
  updated_at: string
}

export interface BookingWithProfiles extends Booking {
  host: Profile
  guest: Profile
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      availabilities: {
        Row: Availability
        Insert: Omit<Availability, 'id' | 'created_at'>
        Update: Partial<Omit<Availability, 'id' | 'user_id' | 'created_at'>>
      }
      bookings: {
        Row: Booking
        Insert: Omit<Booking, 'id' | 'created_at' | 'updated_at' | 'status'> & { status?: BookingStatus }
        Update: Partial<Pick<Booking, 'status'>>
      }
      accommodation_photos: {
        Row: AccommodationPhoto
        Insert: Omit<AccommodationPhoto, 'id' | 'created_at'>
        Update: Partial<Omit<AccommodationPhoto, 'id' | 'user_id' | 'created_at'>>
      }
    }
  }
}
