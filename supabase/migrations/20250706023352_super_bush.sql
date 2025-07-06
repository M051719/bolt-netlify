/*
  # API Integration Tables

  1. New Tables
    - `api_responses` - Store responses from external APIs
    - `weather_queries` - Store weather API queries and responses
  
  2. Security
    - Enable RLS on all tables
    - Add policies for admin access
  
  3. Indexes
    - Optimize for query performance
*/

-- Create api_responses table
CREATE TABLE IF NOT EXISTS api_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  api_type text NOT NULL,
  endpoint text NOT NULL,
  response_data jsonb NOT NULL,
  status_code integer NOT NULL,
  requested_at timestamptz NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create weather_queries table
CREATE TABLE IF NOT EXISTS weather_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  location text NOT NULL,
  provider text NOT NULL,
  forecast boolean DEFAULT false,
  units text DEFAULT 'metric',
  response_data jsonb NOT NULL,
  queried_at timestamptz NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE api_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE weather_queries ENABLE ROW LEVEL SECURITY;

-- Create admin policies for api_responses
CREATE POLICY "Admins can manage all API responses"
  ON api_responses
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create admin policies for weather_queries
CREATE POLICY "Admins can manage all weather queries"
  ON weather_queries
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create user policies for api_responses
CREATE POLICY "Users can read their own API responses"
  ON api_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create user policies for weather_queries
CREATE POLICY "Users can read their own weather queries"
  ON weather_queries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_api_responses_api_type ON api_responses(api_type);
CREATE INDEX IF NOT EXISTS idx_api_responses_requested_at ON api_responses(requested_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_responses_user_id ON api_responses(user_id);

CREATE INDEX IF NOT EXISTS idx_weather_queries_location ON weather_queries(location);
CREATE INDEX IF NOT EXISTS idx_weather_queries_provider ON weather_queries(provider);
CREATE INDEX IF NOT EXISTS idx_weather_queries_queried_at ON weather_queries(queried_at DESC);
CREATE INDEX IF NOT EXISTS idx_weather_queries_user_id ON weather_queries(user_id);