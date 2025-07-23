-- Create custom types for leads table
CREATE TYPE lead_status AS ENUM ('lead', 'qualified', 'disqualified', 'appointment_booked');
CREATE TYPE priority_level AS ENUM ('low', 'medium', 'high');

-- Create leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  status lead_status NOT NULL DEFAULT 'lead',
  source VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  priority priority_level NOT NULL DEFAULT 'medium'
);

-- Create indexes for performance
CREATE INDEX idx_leads_email ON leads(email);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX idx_leads_updated_at ON leads(updated_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_leads_updated_at 
    BEFORE UPDATE ON leads 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add table and column comments
COMMENT ON TABLE leads IS 'Main table for storing lead information';
COMMENT ON COLUMN leads.status IS 'Current status of the lead in the pipeline';
COMMENT ON COLUMN leads.priority IS 'Priority level for lead follow-up';
COMMENT ON COLUMN leads.source IS 'Source where the lead was generated from';