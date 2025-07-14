/*
  # Voice Usage Tracking Schema

  1. New Tables
    - `voice_usage` - Store voice API usage data for tracking and billing
  
  2. Security
    - Enable RLS on voice_usage table
    - Add policies for users to insert and view their own usage data
  
  3. Indexes
    - Create indexes for efficient querying by user_id and created_at
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

-- Create policies
CREATE POLICY "Users can insert their own voice usage"
  ON voice_usage
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own voice usage"
  ON voice_usage
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS voice_usage_user_id_idx ON voice_usage(user_id);
CREATE INDEX IF NOT EXISTS voice_usage_created_at_idx ON voice_usage(created_at);