/*
# Fix voice_usage table and policies

1. New Tables
   - Ensures voice_usage table exists
   - Adds necessary columns and constraints

2. Security
   - Enables RLS on voice_usage table
   - Creates policies if they don't already exist
   - Adds indexes for performance optimization
*/

-- Create voice_usage table if it doesn't exist
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

-- Create insert policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_usage' 
    AND policyname = 'Users can insert their own voice usage'
  ) THEN
    CREATE POLICY "Users can insert their own voice usage"
      ON voice_usage
      FOR INSERT
      TO public
      WITH CHECK (auth.uid() = user_id);
  END IF;
END
$$;

-- Create select policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_usage' 
    AND policyname = 'Users can view their own voice usage'
  ) THEN
    CREATE POLICY "Users can view their own voice usage"
      ON voice_usage
      FOR SELECT
      TO public
      USING (auth.uid() = user_id);
  END IF;
END
$$;

-- Create indexes for performance if they don't exist
CREATE INDEX IF NOT EXISTS voice_usage_user_id_idx ON voice_usage(user_id);
CREATE INDEX IF NOT EXISTS voice_usage_created_at_idx ON voice_usage(created_at);