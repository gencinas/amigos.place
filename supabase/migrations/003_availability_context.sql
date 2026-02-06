-- Add context columns to availabilities table
ALTER TABLE availabilities
  ADD COLUMN accommodation_status TEXT CHECK (accommodation_status IN ('empty', 'host_present', 'shared')),
  ADD COLUMN payment_type TEXT CHECK (payment_type IN ('free', 'friend_price', 'favor', 'service')),
  ADD COLUMN price_amount DECIMAL(10,2),
  ADD COLUMN price_currency TEXT DEFAULT 'EUR',
  ADD COLUMN favor_description TEXT;

-- Set defaults for existing rows
UPDATE availabilities
SET accommodation_status = 'empty',
    payment_type = 'free'
WHERE accommodation_status IS NULL;
