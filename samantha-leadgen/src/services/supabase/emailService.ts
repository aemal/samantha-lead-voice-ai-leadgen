import { supabase, handleSupabaseError } from '@/lib/supabase/client'

export interface Email {
  id: string
  lead_id: string
  email_type: string
  subject: string
  content: string
  sent_at?: string
  opened_at?: string
  clicked_at?: string
  replied_at?: string
  email_status: string
  created_at: string
  updated_at: string
}

export const emailService = {
  // Get all emails for a lead
  async getEmailsByLeadId(leadId: string) {
    try {
      const { data, error } = await supabase
        .from('lead_emails')
        .select('*')
        .eq('lead_id', leadId)
        .order('sent_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Create a new email record
  async createEmail(email: {
    lead_id: string
    email_type: string
    subject: string
    content: string
    sent_at?: string
    opened_at?: string
    clicked_at?: string
    replied_at?: string
    email_status: string
  }) {
    try {
      const { data, error } = await supabase
        .from('lead_emails')
        .insert(email)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Update an email record
  async updateEmail(id: string, updates: {
    subject?: string
    content?: string
    opened_at?: string
    clicked_at?: string
    replied_at?: string
    email_status?: string
  }) {
    try {
      const { data, error } = await supabase
        .from('lead_emails')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Delete an email record
  async deleteEmail(id: string) {
    try {
      const { error } = await supabase
        .from('lead_emails')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: handleSupabaseError(error) }
    }
  },

  // Subscribe to real-time email changes for a lead
  subscribeToEmails(leadId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`emails_${leadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_emails',
          filter: `lead_id=eq.${leadId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }
}