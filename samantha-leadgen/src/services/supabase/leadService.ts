import { supabase, handleSupabaseError } from '@/lib/supabase/client'
import type { Lead, LeadStatus } from '@/types/database'

export const leadService = {
  // Get all leads with optional filters
  async getLeads(filters?: {
    status?: LeadStatus
    priority?: 'low' | 'medium' | 'high'
    search?: string
  }) {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`)
      }

      const { data, error } = await query

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Get a single lead by ID
  async getLeadById(id: string) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Create a new lead
  async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Update an existing lead
  async updateLead(id: string, updates: Partial<Omit<Lead, 'id' | 'created_at' | 'updated_at'>>) {
    try {
      const { data, error } = await supabase
        .from('leads')
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

  // Delete a lead
  async deleteLead(id: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: handleSupabaseError(error) }
    }
  },

  // Subscribe to real-time lead changes
  subscribeToLeads(callback: (payload: any) => void) {
    const subscription = supabase
      .channel('leads_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        callback
      )
      .subscribe()

    return subscription
  },

  // Update lead status
  async updateLeadStatus(id: string, status: LeadStatus) {
    return this.updateLead(id, { status })
  },

  // Get lead statistics
  async getLeadStats() {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('status')

      if (error) throw error

      const stats = {
        total: data.length,
        lead: data.filter(l => l.status === 'lead').length,
        qualified: data.filter(l => l.status === 'qualified').length,
        disqualified: data.filter(l => l.status === 'disqualified').length,
        appointment_booked: data.filter(l => l.status === 'appointment_booked').length,
      }

      return { data: stats, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  }
}