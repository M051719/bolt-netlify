/*
  # Foreclosure Questionnaire Database Schema

  1. New Tables
    - `foreclosure_responses`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - All SPIN questionnaire fields organized by category
      - Contact information fields
      - Status tracking fields

  2. Security
    - Enable RLS on `foreclosure_responses` table
    - Add policies for authenticated users to create and read their own responses
    - Add policy for admin users to read all responses

  3. Indexes
    - Index on user_id for efficient queries
    - Index on created_at for sorting
    - Index on status for filtering
*/

-- Create foreclosure_responses table
CREATE TABLE IF NOT EXISTS foreclosure_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Contact Information
  contact_name text,
  contact_email text,
  contact_phone text,
  
  -- Situation Questions
  situation_length text,
  payment_difficulty_date date,
  lender text,
  payment_status text,
  missed_payments integer DEFAULT 0,
  nod text,
  property_type text,
  relief_contacted text,
  home_value text,
  mortgage_balance text,
  liens text,
  
  -- Problem Questions
  challenge text,
  lender_issue text,
  impact text,
  options_narrowing text,
  third_party_help text,
  overwhelmed text,
  
  -- Implication Questions
  implication_credit text,
  implication_loss text,
  implication_stay_duration text,
  legal_concerns text,
  future_impact text,
  financial_risk text,
  
  -- Need-Payoff Questions
  interested_solution text,
  negotiation_help text,
  sell_feelings text,
  credit_importance text,
  resolution_peace text,
  open_options text,
  
  -- Metadata
  status text DEFAULT 'submitted' CHECK (status IN ('submitted', 'reviewed', 'contacted', 'closed')),
  notes text,
  assigned_to uuid REFERENCES auth.users(id),
  
  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE foreclosure_responses ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own foreclosure responses"
  ON foreclosure_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own foreclosure responses"
  ON foreclosure_responses
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own foreclosure responses"
  ON foreclosure_responses
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin policy (you can create an admin role later)
CREATE POLICY "Admins can read all foreclosure responses"
  ON foreclosure_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_foreclosure_responses_user_id ON foreclosure_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_foreclosure_responses_created_at ON foreclosure_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_foreclosure_responses_status ON foreclosure_responses(status);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_foreclosure_responses_updated_at
  BEFORE UPDATE ON foreclosure_responses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();