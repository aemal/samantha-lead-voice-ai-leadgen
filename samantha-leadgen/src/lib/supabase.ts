import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Server-side client with service role for admin operations
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};

// Database types (matching our schema)
export type Lead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'lead' | 'qualified' | 'disqualified' | 'appointment_booked';
  source?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
  priority: 'low' | 'medium' | 'high';
};

export type PhoneCall = {
  id: string;
  lead_id: string;
  call_date: string;
  duration?: number;
  transcript?: string;
  call_outcome?: 'answered' | 'voicemail' | 'no_answer' | 'busy';
  ai_analysis?: any;
  created_at: string;
};

export type Email = {
  id: string;
  lead_id: string;
  email_type: 'outbound' | 'inbound';
  subject?: string;
  content: string;
  sent_at?: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  email_status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied';
  created_at: string;
  updated_at: string;
};

export type Evaluation = {
  id: string;
  lead_id: string;
  evaluation_type: 'phone' | 'email';
  qualification_score: number;
  evaluation_result: any;
  criteria_met: any;
  confidence_score: number;
  created_at: string;
  evaluator_version: string;
};

export type Comment = {
  id: string;
  lead_id: string;
  user_id: string;
  comment_text: string;
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  parent_comment_id?: string;
};

export type UserProfile = {
  id: string;
  display_name?: string;
  role: 'admin' | 'manager' | 'sales_rep';
  avatar_url?: string;
  created_at: string;
  last_active?: string;
};