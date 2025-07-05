/*
  # Update Membership Tiers

  1. Changes
    - Update membership_tier CHECK constraint from ('free', 'basic', 'premium', 'enterprise') to ('free', 'pro', 'enterprise')
    - Migrate existing 'basic' and 'premium' tiers to 'pro'
  
  2. Security
    - Maintains existing RLS policies
*/

-- Update existing membership tiers
UPDATE profiles
SET membership_tier = 'pro'
WHERE membership_tier IN ('basic', 'premium');

-- Drop the existing CHECK constraint
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_membership_tier_check;

-- Add the new CHECK constraint with updated values
ALTER TABLE profiles
ADD CONSTRAINT profiles_membership_tier_check
CHECK (membership_tier IN ('free', 'pro', 'enterprise'));