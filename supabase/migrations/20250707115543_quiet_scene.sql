/*
# Add API Usage Limits Table

1. New Tables
  - `api_usage_limits` - Stores usage limits for different API features by membership tier
  - `daily_api_usage` - Tracks daily API usage for each user

2. Security
  - Enable RLS on both tables
  - Add policies for admin access to limits table
  - Add policies for user access to their own usage data

3. Changes
  - Add indexes for performance optimization
  - Add foreign key constraints for data integrity
*/

-- Create API usage limits table
CREATE TABLE IF NOT EXISTS api_usage_limits (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  api_type text NOT NULL,
  tier text NOT NULL CHECK (tier IN ('free', 'pro', 'enterprise')),
  daily_limit integer NOT NULL,
  monthly_limit integer NOT NULL,
  max_request_size integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create daily API usage tracking table
CREATE TABLE IF NOT EXISTS daily_api_usage (
  id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  api_type text NOT NULL,
  usage_count integer NOT NULL DEFAULT 0,
  total_characters integer NOT NULL DEFAULT 0,
  usage_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, api_type, usage_date)
);

-- Enable RLS
ALTER TABLE api_usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_api_usage ENABLE ROW LEVEL SECURITY;

-- Create policies for api_usage_limits
CREATE POLICY "Admins can manage API usage limits"
  ON api_usage_limits
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

CREATE POLICY "Public can view API usage limits"
  ON api_usage_limits
  FOR SELECT
  TO public
  USING (true);

-- Create policies for daily_api_usage
CREATE POLICY "Users can view their own API usage"
  ON daily_api_usage
  FOR SELECT
  TO public
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own API usage"
  ON daily_api_usage
  FOR UPDATE
  TO public
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert their own API usage"
  ON daily_api_usage
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS api_usage_limits_api_type_tier_idx ON api_usage_limits(api_type, tier);
CREATE INDEX IF NOT EXISTS daily_api_usage_user_id_idx ON daily_api_usage(user_id);
CREATE INDEX IF NOT EXISTS daily_api_usage_date_idx ON daily_api_usage(usage_date);
CREATE INDEX IF NOT EXISTS daily_api_usage_api_type_idx ON daily_api_usage(api_type);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_api_usage_limits_updated_at
BEFORE UPDATE ON api_usage_limits
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_api_usage_updated_at
BEFORE UPDATE ON daily_api_usage
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default limits for voice API
INSERT INTO api_usage_limits (api_type, tier, daily_limit, monthly_limit, max_request_size)
VALUES 
  ('voice', 'free', 5000, 50000, 1000),
  ('voice', 'pro', 50000, 1000000, 5000),
  ('voice', 'enterprise', 500000, 10000000, 10000);