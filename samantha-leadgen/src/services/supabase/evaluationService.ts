import { supabase, handleSupabaseError } from '@/lib/supabase/client'

export interface Evaluation {
  id: string
  lead_id: string
  evaluation_type: string
  qualification_score: number
  evaluation_result: any
  criteria_met: any
  confidence_score: number
  created_at: string
  evaluator_version: string
}

export const evaluationService = {
  // Get all evaluations for a lead
  async getEvaluationsByLeadId(leadId: string) {
    try {
      const { data, error } = await supabase
        .from('lead_evaluations')
        .select('*')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Create a new evaluation record
  async createEvaluation(evaluation: {
    lead_id: string
    evaluation_type: string
    qualification_score: number
    evaluation_result: any
    criteria_met: any
    confidence_score: number
    evaluator_version: string
  }) {
    try {
      const { data, error } = await supabase
        .from('lead_evaluations')
        .insert(evaluation)
        .select()
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Update an evaluation record
  async updateEvaluation(id: string, updates: {
    qualification_score?: number
    evaluation_result?: any
    criteria_met?: any
    confidence_score?: number
  }) {
    try {
      const { data, error } = await supabase
        .from('lead_evaluations')
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

  // Delete an evaluation record
  async deleteEvaluation(id: string) {
    try {
      const { error } = await supabase
        .from('lead_evaluations')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: handleSupabaseError(error) }
    }
  },

  // Subscribe to real-time evaluation changes for a lead
  subscribeToEvaluations(leadId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`evaluations_${leadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_evaluations',
          filter: `lead_id=eq.${leadId}`
        },
        callback
      )
      .subscribe()

    return subscription
  }
}