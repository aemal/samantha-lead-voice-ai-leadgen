-- Create custom type for call outcomes
CREATE TYPE call_outcome_type AS ENUM ('answered', 'voicemail', 'no_answer', 'busy');

-- Create lead_phone_calls table
CREATE TABLE lead_phone_calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  call_date TIMESTAMP WITH TIME ZONE NOT NULL,
  duration INTEGER, -- duration in seconds
  transcript TEXT,
  call_outcome call_outcome_type,
  ai_analysis JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_lead_phone_calls_lead_id ON lead_phone_calls(lead_id);
CREATE INDEX idx_lead_phone_calls_call_date ON lead_phone_calls(call_date DESC);
CREATE INDEX idx_lead_phone_calls_call_outcome ON lead_phone_calls(call_outcome);
CREATE INDEX idx_lead_phone_calls_created_at ON lead_phone_calls(created_at DESC);

-- Enable Row Level Security
ALTER TABLE lead_phone_calls ENABLE ROW LEVEL SECURITY;

-- Create RLS policies - users can access phone calls for leads they can see
CREATE POLICY "Users can view phone calls for accessible leads" ON lead_phone_calls
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_phone_calls.lead_id
  )
);

CREATE POLICY "Authenticated users can insert phone calls" ON lead_phone_calls
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_phone_calls.lead_id
  )
);

CREATE POLICY "Authenticated users can update phone calls" ON lead_phone_calls
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_phone_calls.lead_id
  )
);

-- Add table and column comments
COMMENT ON TABLE lead_phone_calls IS 'Records of phone calls made to leads';
COMMENT ON COLUMN lead_phone_calls.duration IS 'Call duration in seconds';
COMMENT ON COLUMN lead_phone_calls.ai_analysis IS 'JSON data containing AI analysis of the call';