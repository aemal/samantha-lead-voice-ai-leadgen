import { supabase, handleSupabaseError } from '@/lib/supabase/client'

export interface PhoneCall {
  id: string
  lead_id: string
  call_date: string
  duration?: number
  transcript?: string
  call_outcome?: string
  ai_analysis?: any
  created_at: string
}

export const phoneCallService = {
  // Get all phone calls for a lead
  async getPhoneCallsByLeadId(leadId: string) {
    try {
      const { data, error } = await supabase
        .from('lead_phone_calls')
        .select('*')
        .eq('lead_id', leadId)
        .order('call_date', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Create a new phone call record
  async createPhoneCall(phoneCall: {
    lead_id: string
    call_date: string
    duration?: number
    transcript?: string
    call_outcome?: string
    ai_analysis?: any
  }) {
    try {
      const { data, error } = await supabase
        .from('lead_phone_calls')
        .insert(phoneCall)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Update a phone call record
  async updatePhoneCall(id: string, updates: {
    call_date?: string
    duration?: number
    transcript?: string
    call_outcome?: string
    ai_analysis?: any
  }) {
    try {
      const { data, error } = await supabase
        .from('lead_phone_calls')
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

  // Delete a phone call record
  async deletePhoneCall(id: string) {
    try {
      const { error } = await supabase
        .from('lead_phone_calls')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: handleSupabaseError(error) }
    }
  },

  // Subscribe to real-time phone call changes for a lead
  subscribeToPhoneCalls(leadId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`phone_calls_${leadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_phone_calls',
          filter: `lead_id=eq.${leadId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }
}