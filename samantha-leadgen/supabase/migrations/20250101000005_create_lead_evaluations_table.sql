-- Create custom type for evaluation type
CREATE TYPE evaluation_type_enum AS ENUM ('phone', 'email');

-- Create lead_evaluations table
CREATE TABLE lead_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  evaluation_type evaluation_type_enum NOT NULL,
  qualification_score INTEGER NOT NULL CHECK (qualification_score >= 1 AND qualification_score <= 100),
  evaluation_result JSONB NOT NULL,
  criteria_met JSONB NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  evaluator_version VARCHAR(50) NOT NULL
);

-- Create indexes for performance
CREATE INDEX idx_lead_evaluations_lead_id ON lead_evaluations(lead_id);
CREATE INDEX idx_lead_evaluations_evaluation_type ON lead_evaluations(evaluation_type);
CREATE INDEX idx_lead_evaluations_qualification_score ON lead_evaluations(qualification_score DESC);
CREATE INDEX idx_lead_evaluations_created_at ON lead_evaluations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE lead_evaluations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view evaluations for accessible leads" ON lead_evaluations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_evaluations.lead_id
  )
);

CREATE POLICY "Authenticated users can insert evaluations" ON lead_evaluations
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_evaluations.lead_id
  )
);

-- Add table and column comments
COMMENT ON TABLE lead_evaluations IS 'Stores evaluation results for leads based on phone calls and emails';
COMMENT ON COLUMN lead_evaluations.evaluation_result IS 'Detailed JSON output from the evaluation algorithm';
COMMENT ON COLUMN lead_evaluations.criteria_met IS 'JSON structure indicating which qualification criteria were met';
COMMENT ON COLUMN lead_evaluations.confidence_score IS 'AI confidence level (0.00-9.99)';