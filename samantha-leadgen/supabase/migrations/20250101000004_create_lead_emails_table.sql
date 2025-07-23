-- Create custom types for email table
CREATE TYPE email_type_enum AS ENUM ('outbound', 'inbound');
CREATE TYPE email_status_enum AS ENUM ('sent', 'delivered', 'opened', 'clicked', 'replied');

-- Create lead_emails table
CREATE TABLE lead_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  email_type email_type_enum NOT NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  replied_at TIMESTAMP WITH TIME ZONE,
  email_status email_status_enum NOT NULL DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_lead_emails_lead_id ON lead_emails(lead_id);
CREATE INDEX idx_lead_emails_email_type ON lead_emails(email_type);
CREATE INDEX idx_lead_emails_email_status ON lead_emails(email_status);
CREATE INDEX idx_lead_emails_sent_at ON lead_emails(sent_at DESC);
CREATE INDEX idx_lead_emails_created_at ON lead_emails(created_at DESC);

-- Create trigger to update updated_at
CREATE TRIGGER update_lead_emails_updated_at
    BEFORE UPDATE ON lead_emails
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE lead_emails ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view emails for accessible leads" ON lead_emails
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_emails.lead_id
  )
);

CREATE POLICY "Authenticated users can insert emails" ON lead_emails
FOR INSERT WITH CHECK (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_emails.lead_id
  )
);

CREATE POLICY "Authenticated users can update emails" ON lead_emails
FOR UPDATE USING (
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_emails.lead_id
  )
);

-- Add table and column comments
COMMENT ON TABLE lead_emails IS 'Stores all email communications with leads';
COMMENT ON COLUMN lead_emails.email_type IS 'Direction of email: outbound or inbound';
COMMENT ON COLUMN lead_emails.email_status IS 'Current status of the email in delivery/engagement lifecycle';