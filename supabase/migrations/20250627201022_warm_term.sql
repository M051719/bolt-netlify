/*
  # AI Call Answering System Database Schema

  1. New Tables
    - `ai_calls` - Store call session data and metadata
    - `call_transcripts` - Store conversation transcripts
    - `call_intents` - Store identified intents and entities
    - `agent_handoffs` - Track when calls are transferred to human agents

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access and user data protection

  3. Indexes
    - Optimize for call lookup and reporting queries
*/

-- Create ai_calls table
CREATE TABLE IF NOT EXISTS ai_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid text UNIQUE NOT NULL,
  phone_number text NOT NULL,
  caller_name text,
  call_status text DEFAULT 'in-progress' CHECK (call_status IN ('in-progress', 'completed', 'failed', 'transferred')),
  call_duration integer DEFAULT 0,
  ai_confidence_score decimal(3,2),
  primary_intent text,
  requires_human_followup boolean DEFAULT false,
  foreclosure_response_id uuid REFERENCES foreclosure_responses(id),
  assigned_agent_id uuid REFERENCES auth.users(id),
  call_summary text,
  next_action text,
  priority_level text DEFAULT 'medium' CHECK (priority_level IN ('low', 'medium', 'high', 'urgent')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create call_transcripts table
CREATE TABLE IF NOT EXISTS call_transcripts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES ai_calls(id) ON DELETE CASCADE,
  speaker text NOT NULL CHECK (speaker IN ('caller', 'ai', 'agent')),
  message text NOT NULL,
  confidence_score decimal(3,2),
  timestamp_offset integer NOT NULL, -- Seconds from call start
  intent_detected text,
  entities jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create call_intents table
CREATE TABLE IF NOT EXISTS call_intents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES ai_calls(id) ON DELETE CASCADE,
  intent_name text NOT NULL,
  confidence_score decimal(3,2) NOT NULL,
  entities jsonb,
  fulfilled boolean DEFAULT false,
  response_provided text,
  requires_followup boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create agent_handoffs table
CREATE TABLE IF NOT EXISTS agent_handoffs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id uuid REFERENCES ai_calls(id) ON DELETE CASCADE,
  reason text NOT NULL,
  ai_summary text,
  agent_id uuid REFERENCES auth.users(id),
  handoff_time timestamptz DEFAULT now(),
  resolution_time timestamptz,
  outcome text,
  notes text
);

-- Enable RLS on all tables
ALTER TABLE ai_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_handoffs ENABLE ROW LEVEL SECURITY;

-- Create admin policies for ai_calls
CREATE POLICY "Admins can manage all AI calls"
  ON ai_calls
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create admin policies for call_transcripts
CREATE POLICY "Admins can manage all call transcripts"
  ON call_transcripts
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create admin policies for call_intents
CREATE POLICY "Admins can manage all call intents"
  ON call_intents
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create admin policies for agent_handoffs
CREATE POLICY "Admins can manage all agent handoffs"
  ON agent_handoffs
  FOR ALL
  TO authenticated
  USING (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_calls_call_sid ON ai_calls(call_sid);
CREATE INDEX IF NOT EXISTS idx_ai_calls_phone_number ON ai_calls(phone_number);
CREATE INDEX IF NOT EXISTS idx_ai_calls_created_at ON ai_calls(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_calls_status ON ai_calls(call_status);
CREATE INDEX IF NOT EXISTS idx_ai_calls_priority ON ai_calls(priority_level);

CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_id ON call_transcripts(call_id);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_speaker ON call_transcripts(speaker);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_timestamp ON call_transcripts(timestamp_offset);

CREATE INDEX IF NOT EXISTS idx_call_intents_call_id ON call_intents(call_id);
CREATE INDEX IF NOT EXISTS idx_call_intents_intent ON call_intents(intent_name);
CREATE INDEX IF NOT EXISTS idx_call_intents_confidence ON call_intents(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_agent_handoffs_call_id ON agent_handoffs(call_id);
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_agent_id ON agent_handoffs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_handoffs_time ON agent_handoffs(handoff_time DESC);

-- Create updated_at trigger for ai_calls
CREATE TRIGGER update_ai_calls_updated_at
  BEFORE UPDATE ON ai_calls
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();