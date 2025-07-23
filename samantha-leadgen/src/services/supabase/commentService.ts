import { supabase, handleSupabaseError } from '@/lib/supabase/client'

export interface Comment {
  id: string
  lead_id: string
  user_id: string
  comment_text: string
  is_internal: boolean
  created_at: string
  updated_at: string
  user?: {
    display_name: string
    avatar_url?: string
  }
}

export const commentService = {
  // Get all comments for a lead
  async getCommentsByLeadId(leadId: string) {
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .select(`
          *,
          user:user_profiles!lead_comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Create a new comment
  async createComment(comment: {
    lead_id: string
    comment_text: string
    is_internal: boolean
    user_id?: string
  }) {
    try {
      // If no user_id provided, try to get current user
      let userId = comment.user_id
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        userId = user?.id
      }

      const { data, error } = await supabase
        .from('lead_comments')
        .insert({
          ...comment,
          user_id: userId || 'system' // Fallback to 'system' if no user
        })
        .select(`
          *,
          user:user_profiles!lead_comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Update a comment
  async updateComment(id: string, updates: {
    comment_text?: string
    is_internal?: boolean
  }) {
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          user:user_profiles!lead_comments_user_id_fkey (
            display_name,
            avatar_url
          )
        `)
        .single()

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
  },

  // Delete a comment
  async deleteComment(id: string) {
    try {
      const { error } = await supabase
        .from('lead_comments')
        .delete()
        .eq('id', id)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error: handleSupabaseError(error) }
    }
  },

  // Subscribe to real-time comment changes for a lead
  subscribeToComments(leadId: string, callback: (payload: any) => void) {
    const subscription = supabase
      .channel(`comments_${leadId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lead_comments',
          filter: `lead_id=eq.${leadId}`
        },
        callback
      )
      .subscribe()

    return subscription
  },

  // Get comment count for a lead
  async getCommentCount(leadId: string) {
    try {
      const { count, error } = await supabase
        .from('lead_comments')
        .select('*', { count: 'exact', head: true })
        .eq('lead_id', leadId)

      if (error) throw error
      return { data: count || 0, error: null }
    } catch (error) {
      return { data: 0, error: handleSupabaseError(error) }
    }
  }
}