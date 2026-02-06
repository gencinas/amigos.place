export type AccommodationType = 'room' | 'sofa' | 'other'
export type BookingStatus = 'pending' | 'accepted' | 'declined' | 'cancelled'

export interface Profile {
  id: string
  username: string
  display_name: string
  city: string
  country: string
  accommodation_type: AccommodationType
  bio: string | null
  created_at: string
}

export interface Availability {
  id: string
  user_id: string
  start_date: string
  end_date: string
  notes: string | null
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
    }
  }
}
