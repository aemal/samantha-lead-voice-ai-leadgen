-- Create lead_comments table
CREATE TABLE lead_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parent_comment_id UUID REFERENCES lead_comments(id) ON DELETE SET NULL
);

-- Create indexes for performance
CREATE INDEX idx_lead_comments_lead_id ON lead_comments(lead_id);
CREATE INDEX idx_lead_comments_user_id ON lead_comments(user_id);
CREATE INDEX idx_lead_comments_parent_id ON lead_comments(parent_comment_id);
CREATE INDEX idx_lead_comments_created_at ON lead_comments(created_at DESC);

-- Create trigger to update updated_at
CREATE TRIGGER update_lead_comments_updated_at
    BEFORE UPDATE ON lead_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE lead_comments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view comments they have access to" ON lead_comments
FOR SELECT USING (
  -- Users can see their own comments
  auth.uid() = user_id
  -- Users can see non-internal comments
  OR is_internal = false
  -- Admins and managers can see all comments
  OR EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('admin', 'manager')
  )
  -- Users can see comments for leads they have access to
  OR EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_comments.lead_id
  )
);

CREATE POLICY "Users can insert their own comments" ON lead_comments
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM leads 
    WHERE leads.id = lead_comments.lead_id
  )
);

CREATE POLICY "Users can update their own comments" ON lead_comments
FOR UPDATE USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON lead_comments
FOR DELETE USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid() 
    AND user_profiles.role IN ('admin', 'manager')
  )
);

-- Add table comments
COMMENT ON TABLE lead_comments IS 'Stores comments made by users on leads, supporting internal notes and threaded discussions';
COMMENT ON COLUMN lead_comments.is_internal IS 'Whether the comment is internal (only visible to team members)';
COMMENT ON COLUMN lead_comments.parent_comment_id IS 'References parent comment for threading';