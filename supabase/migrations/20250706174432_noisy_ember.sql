/*
  # Add Voice Usage Tracking Table

  1. New Tables
    - `voice_usage` - Track text-to-speech API usage
      - `id` (bigint, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `text_length` (integer)
      - `voice` (text)
      - `model` (text)
      - `tier` (text)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `voice_usage` table
    - Add policies for users to insert and view their own usage data

  3. Indexes
    - Index on user_id for efficient queries
    - Index on created_at for sorting and reporting
*/

-- Create voice_usage table
CREATE TABLE IF NOT EXISTS voice_usage (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text_length integer NOT NULL,
  voice text NOT NULL,
  model text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE voice_usage ENABLE ROW LEVEL SECURITY;

-- Create policies (only if they don't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_usage' AND policyname = 'Users can insert their own voice usage'
  ) THEN
    CREATE POLICY "Users can insert their own voice usage"
      ON voice_usage
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_usage' AND policyname = 'Users can view their own voice usage'
  ) THEN
    CREATE POLICY "Users can view their own voice usage"
      ON voice_usage
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create indexes for performance (IF NOT EXISTS is built into CREATE INDEX)
CREATE INDEX IF NOT EXISTS voice_usage_user_id_idx ON voice_usage(user_id);
CREATE INDEX IF NOT EXISTS voice_usage_created_at_idx ON voice_usage(created_at);