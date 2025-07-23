export type LeadStatus = 'lead' | 'qualified' | 'disqualified' | 'appointment_booked'
export type Priority = 'low' | 'medium' | 'high'
export type UserRole = 'admin' | 'manager' | 'sales_rep'

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  status: LeadStatus
  source?: string
  created_at: string
  updated_at: string
  notes?: string
  priority: Priority
}

export interface UserProfile {
  id: string
  display_name?: string
  role: UserRole
  avatar_url?: string
  created_at: string
  last_active?: string
}

export interface LeadComment {
  id: string
  lead_id: string
  user_id: string
  comment_text: string
  is_internal: boolean
  created_at: string
  updated_at: string
}

export interface LeadPhoneCall {
  id: string
  lead_id: string
  call_date: string
  duration?: number
  transcript?: string
  call_outcome?: string
  ai_analysis?: any
  created_at: string
}

export interface LeadEmail {
  id: string
  lead_id: string
  email_type: string
  subject: string
  content: string
  sent_at?: string
  opened_at?: string
  clicked_at?: string
  replied_at?: string
  email_status?: string
  created_at: string
}

export interface LeadEvaluation {
  id: string
  lead_id: string
  evaluation_type: string
  qualification_score?: number
  evaluation_result?: any
  criteria_met?: any
  confidence_score?: number
  created_at: string
  evaluator_version?: string
}