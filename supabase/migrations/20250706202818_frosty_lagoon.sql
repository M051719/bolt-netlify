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

-- Enable RLS if not already enabled
ALTER TABLE voice_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Users can insert their own voice usage" ON voice_usage;
DROP POLICY IF EXISTS "Users can view their own voice usage" ON voice_usage;

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