export type LeadStatus = 'lead' | 'qualified' | 'appointment_booked' | 'disqualified';
export type LeadPriority = 'low' | 'medium' | 'high';
export type CallOutcome = 'answered' | 'voicemail' | 'no_answer' | 'busy';
export type EmailType = 'outbound' | 'inbound';
export type EmailStatus = 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied';
export type EvaluationType = 'phone' | 'email';
export type UserRole = 'admin' | 'manager' | 'sales_rep';

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: LeadStatus;
  source: string;
  created_at: string;
  updated_at: string;
  notes: string;
  priority: LeadPriority;
}

export interface PhoneCall {
  id: string;
  lead_id: string;
  call_date: string;
  duration: number; // seconds
  transcript: string;
  call_outcome: CallOutcome;
  ai_analysis: {
    interest_level: number;
    budget_qualified: boolean;
    decision_maker: boolean;
    timeline: string;
    pain_points: string[];
    next_steps: string;
  };
  created_at: string;
}

export interface Email {
  id: string;
  lead_id: string;
  email_type: EmailType;
  subject: string;
  content: string;
  sent_at: string;
  opened_at?: string;
  clicked_at?: string;
  replied_at?: string;
  email_status: EmailStatus;
}

export interface Evaluation {
  id: string;
  lead_id: string;
  evaluation_type: EvaluationType;
  qualification_score: number; // 1-100
  evaluation_result: {
    qualified: boolean;
    reason: string;
    strengths: string[];
    concerns: string[];
    recommendation: string;
  };
  criteria_met: {
    budget: boolean;
    authority: boolean;
    need: boolean;
    timeline: boolean;
  };
  confidence_score: number; // 0.00-1.00
  created_at: string;
  evaluator_version: string;
}

export interface Comment {
  id: string;
  lead_id: string;
  user_id: string;
  content: string; // Changed from comment_text to content for rich text support
  is_internal: boolean;
  created_at: string;
  updated_at: string;
  parent_id?: string; // Changed from parent_comment_id to parent_id for consistency
  is_edited?: boolean; // Track if comment has been edited
}

export interface UserProfile {
  id: string;
  display_name: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  last_active: string;
}

export interface MockData {
  leads: Lead[];
  phone_calls: PhoneCall[];
  emails: Email[];
  evaluations: Evaluation[];
  comments: Comment[];
  users: UserProfile[];
}