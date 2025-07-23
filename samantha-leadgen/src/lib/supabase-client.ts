import { supabase } from './supabase';
import type { Lead, PhoneCall, Email, Evaluation, Comment } from './supabase';

export class SupabaseService {
  // Lead operations
  static async getLeads(filters?: {
    status?: string;
    priority?: string;
    search?: string;
  }) {
    try {
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      
      if (filters?.priority) {
        query = query.eq('priority', filters.priority);
      }
      
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Lead[];
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  static async getLead(id: string) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          *,
          lead_phone_calls(*),
          lead_emails(*),
          lead_evaluations(*),
          lead_comments(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching lead:', error);
      throw error;
    }
  }

  static async createLead(lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert(lead)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  static async updateLead(id: string, updates: Partial<Lead>) {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }

  static async deleteLead(id: string) {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  // Phone call operations
  static async getPhoneCalls(leadId?: string) {
    try {
      let query = supabase
        .from('lead_phone_calls')
        .select('*')
        .order('call_date', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as PhoneCall[];
    } catch (error) {
      console.error('Error fetching phone calls:', error);
      throw error;
    }
  }

  static async createPhoneCall(call: Omit<PhoneCall, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('lead_phone_calls')
        .insert(call)
        .select()
        .single();

      if (error) throw error;
      return data as PhoneCall;
    } catch (error) {
      console.error('Error creating phone call:', error);
      throw error;
    }
  }

  // Email operations
  static async getEmails(leadId?: string) {
    try {
      let query = supabase
        .from('lead_emails')
        .select('*')
        .order('sent_at', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Email[];
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  static async createEmail(email: Omit<Email, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('lead_emails')
        .insert(email)
        .select()
        .single();

      if (error) throw error;
      return data as Email;
    } catch (error) {
      console.error('Error creating email:', error);
      throw error;
    }
  }

  // Evaluation operations
  static async getEvaluations(leadId?: string) {
    try {
      let query = supabase
        .from('lead_evaluations')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Evaluation[];
    } catch (error) {
      console.error('Error fetching evaluations:', error);
      throw error;
    }
  }

  static async createEvaluation(evaluation: Omit<Evaluation, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('lead_evaluations')
        .insert(evaluation)
        .select()
        .single();

      if (error) throw error;
      return data as Evaluation;
    } catch (error) {
      console.error('Error creating evaluation:', error);
      throw error;
    }
  }

  // Comment operations
  static async getComments(leadId?: string) {
    try {
      let query = supabase
        .from('lead_comments')
        .select('*')
        .order('created_at', { ascending: false });

      if (leadId) {
        query = query.eq('lead_id', leadId);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Comment[];
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  static async createComment(comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .insert(comment)
        .select()
        .single();

      if (error) throw error;
      return data as Comment;
    } catch (error) {
      console.error('Error creating comment:', error);
      throw error;
    }
  }

  static async updateComment(id: string, updates: Partial<Comment>) {
    try {
      const { data, error } = await supabase
        .from('lead_comments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as Comment;
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }

  static async deleteComment(id: string) {
    try {
      const { error } = await supabase
        .from('lead_comments')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }

  // Real-time subscriptions
  static subscribeToLeads(callback: (payload: any) => void) {
    return supabase
      .channel('leads_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'leads'
        },
        callback
      )
      .subscribe();
  }

  static subscribeToComments(leadId: string, callback: (payload: any) => void) {
    return supabase
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
      .subscribe();
  }
}