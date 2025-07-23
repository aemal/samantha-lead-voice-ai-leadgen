'use client';

import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import { Lead, MockData, PhoneCall, Email, Evaluation, Comment } from '@/types';
import mockDataJson from '@/data/mock.json';
import { leadService } from '@/services/supabase/leadService';
import { commentService } from '@/services/supabase/commentService';
import { phoneCallService } from '@/services/supabase/phoneCallService';
import { emailService } from '@/services/supabase/emailService';
import { evaluationService } from '@/services/supabase/evaluationService';

// Action types
type DataAction = 
  | { type: 'SET_LEADS'; payload: Lead[] }
  | { type: 'ADD_LEAD'; payload: Lead }
  | { type: 'UPDATE_LEAD'; payload: { id: string; updates: Partial<Lead> } }
  | { type: 'DELETE_LEAD'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_STATUS_FILTER'; payload: Lead['status'] | 'all' }
  | { type: 'SET_PRIORITY_FILTER'; payload: Lead['priority'] | 'all' }
  | { type: 'SET_DATE_RANGE_FILTER'; payload: { start: string | null; end: string | null } }
  | { type: 'SET_SORT_BY'; payload: SortOption }
  | { type: 'SET_SORT_ORDER'; payload: 'asc' | 'desc' }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'SET_COMMENTS'; payload: Comment[] }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'UPDATE_COMMENT'; payload: { id: string; updates: Partial<Comment> } }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'SET_PHONE_CALLS'; payload: PhoneCall[] }
  | { type: 'ADD_PHONE_CALL'; payload: PhoneCall }
  | { type: 'SET_EMAILS'; payload: Email[] }
  | { type: 'ADD_EMAIL'; payload: Email }
  | { type: 'SET_EVALUATIONS'; payload: Evaluation[] }
  | { type: 'ADD_EVALUATION'; payload: Evaluation };

type SortOption = 'name' | 'created_at' | 'updated_at' | 'priority' | 'status';

interface FilterState {
  searchQuery: string;
  statusFilter: Lead['status'] | 'all';
  priorityFilter: Lead['priority'] | 'all';
  dateRangeFilter: { start: string | null; end: string | null };
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

interface DataState {
  leads: Lead[];
  phoneCalls: PhoneCall[];
  emails: Email[];
  evaluations: Evaluation[];
  comments: Comment[];
  filters: FilterState;
  loading: boolean;
}

interface DataContextType {
  state: DataState;
  filteredLeads: Lead[];
  // Lead operations
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => void;
  updateLead: (id: string, updates: Partial<Lead>) => void;
  deleteLead: (id: string) => void;
  // Filter operations
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: Lead['status'] | 'all') => void;
  setPriorityFilter: (priority: Lead['priority'] | 'all') => void;
  setDateRangeFilter: (start: string | null, end: string | null) => void;
  setSortBy: (sortBy: SortOption) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  clearFilters: () => void;
  // Data getters
  getLeadById: (id: string) => Lead | undefined;
  getPhoneCallsByLeadId: (leadId: string) => PhoneCall[];
  getEmailsByLeadId: (leadId: string) => Email[];
  getEvaluationsByLeadId: (leadId: string) => Evaluation[];
  getCommentsByLeadId: (leadId: string) => Comment[];
  // Comment operations
  addComment: (comment: Comment) => void;
  updateComment: (id: string, updates: Partial<Comment>) => void;
  deleteComment: (id: string) => void;
}

const initialFilterState: FilterState = {
  searchQuery: '',
  statusFilter: 'all',
  priorityFilter: 'all',
  dateRangeFilter: { start: null, end: null },
  sortBy: 'updated_at',
  sortOrder: 'desc',
};

const initialState: DataState = {
  leads: [],
  phoneCalls: [],
  emails: [],
  evaluations: [],
  comments: [],
  filters: initialFilterState,
  loading: true,
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LEADS':
      return { ...state, leads: action.payload, loading: false };
    
    case 'ADD_LEAD': {
      const newLeads = [...state.leads, action.payload];
      return { ...state, leads: newLeads };
    }
    
    case 'UPDATE_LEAD': {
      const updatedLeads = state.leads.map(lead =>
        lead.id === action.payload.id
          ? { ...lead, ...action.payload.updates, updated_at: new Date().toISOString() }
          : lead
      );
      return { ...state, leads: updatedLeads };
    }
    
    case 'DELETE_LEAD': {
      const filteredLeads = state.leads.filter(lead => lead.id !== action.payload);
      return { ...state, leads: filteredLeads };
    }
    
    case 'SET_SEARCH_QUERY':
      return { ...state, filters: { ...state.filters, searchQuery: action.payload } };
    
    case 'SET_STATUS_FILTER':
      return { ...state, filters: { ...state.filters, statusFilter: action.payload } };
    
    case 'SET_PRIORITY_FILTER':
      return { ...state, filters: { ...state.filters, priorityFilter: action.payload } };
    
    case 'SET_DATE_RANGE_FILTER':
      return { ...state, filters: { ...state.filters, dateRangeFilter: action.payload } };
    
    case 'SET_SORT_BY':
      return { ...state, filters: { ...state.filters, sortBy: action.payload } };
    
    case 'SET_SORT_ORDER':
      return { ...state, filters: { ...state.filters, sortOrder: action.payload } };
    
    case 'CLEAR_FILTERS':
      return { ...state, filters: { ...initialFilterState, sortBy: state.filters.sortBy, sortOrder: state.filters.sortOrder } };
    
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    
    case 'ADD_COMMENT': {
      const newComments = [...state.comments, action.payload];
      return { ...state, comments: newComments };
    }
    
    case 'UPDATE_COMMENT': {
      const updatedComments = state.comments.map(comment =>
        comment.id === action.payload.id
          ? { ...comment, ...action.payload.updates, updated_at: new Date().toISOString() }
          : comment
      );
      return { ...state, comments: updatedComments };
    }
    
    case 'DELETE_COMMENT': {
      const filteredComments = state.comments.filter(comment => comment.id !== action.payload);
      return { ...state, comments: filteredComments };
    }
    
    case 'SET_PHONE_CALLS':
      return { ...state, phoneCalls: action.payload };
    
    case 'ADD_PHONE_CALL': {
      const newPhoneCalls = [...state.phoneCalls, action.payload];
      return { ...state, phoneCalls: newPhoneCalls };
    }
    
    case 'SET_EMAILS':
      return { ...state, emails: action.payload };
    
    case 'ADD_EMAIL': {
      const newEmails = [...state.emails, action.payload];
      return { ...state, emails: newEmails };
    }
    
    case 'SET_EVALUATIONS':
      return { ...state, evaluations: action.payload };
    
    case 'ADD_EVALUATION': {
      const newEvaluations = [...state.evaluations, action.payload];
      return { ...state, evaluations: newEvaluations };
    }
    
    default:
      return state;
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Load all data from Supabase services
  const loadAllSupabaseData = useCallback(async (leads: Lead[]) => {
    try {
      // Load phone calls
      const phoneCallsPromises = leads.map(lead => phoneCallService.getPhoneCallsByLeadId(lead.id));
      const phoneCallsResults = await Promise.all(phoneCallsPromises);
      const allPhoneCalls = phoneCallsResults.flatMap(result => result.data || []);
      dispatch({ type: 'SET_PHONE_CALLS', payload: allPhoneCalls });

      // Load emails
      const emailsPromises = leads.map(lead => emailService.getEmailsByLeadId(lead.id));
      const emailsResults = await Promise.all(emailsPromises);
      const allEmails = emailsResults.flatMap(result => result.data || []);
      dispatch({ type: 'SET_EMAILS', payload: allEmails });

      // Load evaluations
      const evaluationsPromises = leads.map(lead => evaluationService.getEvaluationsByLeadId(lead.id));
      const evaluationsResults = await Promise.all(evaluationsPromises);
      const allEvaluations = evaluationsResults.flatMap(result => result.data || []);
      dispatch({ type: 'SET_EVALUATIONS', payload: allEvaluations });

      // Load comments
      const commentsPromises = leads.map(lead => commentService.getCommentsByLeadId(lead.id));
      const commentsResults = await Promise.all(commentsPromises);
      const allComments = commentsResults.flatMap(result => {
        return (result.data || []).map(comment => ({
          id: comment.id,
          lead_id: comment.lead_id,
          user_id: comment.user_id,
          content: comment.comment_text,
          is_internal: comment.is_internal,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          parent_id: comment.parent_comment_id,
          is_edited: comment.created_at !== comment.updated_at
        }));
      });
      dispatch({ type: 'SET_COMMENTS', payload: allComments });

      console.log('📊 Loaded from Supabase:', {
        phoneCalls: allPhoneCalls.length,
        emails: allEmails.length,
        evaluations: allEvaluations.length,
        comments: allComments.length
      });
    } catch (error) {
      console.error('Error loading Supabase data:', error);
    }
  }, []);

  // Initialize data from Supabase or mock data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from Supabase first
        console.log('🔄 Attempting to load data from Supabase...');
        const { data: leads, error } = await leadService.getLeads();
        
        console.log('Supabase response:', { leads: leads?.length, error });
        
        if (!error && leads && leads.length > 0) {
          console.log('✅ Successfully loaded', leads.length, 'leads from Supabase');
          dispatch({ type: 'SET_LEADS', payload: leads });
          
          // Load all related data from Supabase
          await loadAllSupabaseData(leads);
          
          // Set up real-time subscription
          const subscription = leadService.subscribeToLeads((payload) => {
            console.log('Real-time lead update:', payload);
            
            if (payload.eventType === 'INSERT' && payload.new) {
              dispatch({ type: 'ADD_LEAD', payload: payload.new as Lead });
            } else if (payload.eventType === 'UPDATE' && payload.new) {
              dispatch({ 
                type: 'UPDATE_LEAD', 
                payload: { 
                  id: (payload.new as Lead).id, 
                  updates: payload.new as Lead 
                } 
              });
            } else if (payload.eventType === 'DELETE' && payload.old) {
              dispatch({ type: 'DELETE_LEAD', payload: (payload.old as any).id });
            }
          });

          return () => {
            subscription.unsubscribe();
          };
        } else {
          throw new Error('No data from Supabase, falling back to mock data');
        }
      } catch (error) {
        // Fall back to mock data
        console.log('❌ Supabase failed, falling back to mock data. Error:', error);
        const mockData = mockDataJson as any;
        dispatch({ type: 'SET_LEADS', payload: mockData.leads });
        
        // Convert mock comments to new format and set them
        const convertedComments = mockData.comments.map((comment: any) => ({
          id: comment.id,
          lead_id: comment.lead_id,
          user_id: comment.user_id,
          content: comment.comment_text || comment.content,
          is_internal: comment.is_internal,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          parent_id: comment.parent_comment_id || comment.parent_id,
          is_edited: comment.is_edited || (comment.created_at !== comment.updated_at)
        }));
        dispatch({ type: 'SET_COMMENTS', payload: convertedComments });
        console.log('📝 Loaded', convertedComments.length, 'comments from mock data');
      }
    };

    loadData();
  }, []);

  // Memoized filtered and sorted leads
  const filteredLeads = useMemo(() => {
    let filtered = [...state.leads];

    // Apply search filter
    if (state.filters.searchQuery.trim()) {
      const query = state.filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        lead.phone.includes(query) ||
        lead.notes.toLowerCase().includes(query) ||
        lead.source.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (state.filters.statusFilter !== 'all') {
      filtered = filtered.filter(lead => lead.status === state.filters.statusFilter);
    }

    // Apply priority filter
    if (state.filters.priorityFilter !== 'all') {
      filtered = filtered.filter(lead => lead.priority === state.filters.priorityFilter);
    }

    // Apply date range filter
    if (state.filters.dateRangeFilter.start || state.filters.dateRangeFilter.end) {
      filtered = filtered.filter(lead => {
        const leadDate = new Date(lead.created_at);
        const startDate = state.filters.dateRangeFilter.start ? new Date(state.filters.dateRangeFilter.start) : null;
        const endDate = state.filters.dateRangeFilter.end ? new Date(state.filters.dateRangeFilter.end) : null;
        
        if (startDate && leadDate < startDate) return false;
        if (endDate && leadDate > endDate) return false;
        return true;
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (state.filters.sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'updated_at':
          aValue = new Date(a.updated_at);
          bValue = new Date(b.updated_at);
          break;
        case 'priority':
          const priorityOrder = { low: 1, medium: 2, high: 3 };
          aValue = priorityOrder[a.priority];
          bValue = priorityOrder[b.priority];
          break;
        case 'status':
          const statusOrder = { lead: 1, qualified: 2, appointment_booked: 3, disqualified: 4 };
          aValue = statusOrder[a.status];
          bValue = statusOrder[b.status];
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return state.filters.sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return state.filters.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [state.leads, state.filters]);

  // Action creators - now using Supabase
  const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await leadService.createLead(leadData);
      
      if (error) {
        console.error('Error adding lead:', error);
        // Fall back to local addition
        const newLead: Lead = {
          ...leadData,
          id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        dispatch({ type: 'ADD_LEAD', payload: newLead });
      }
      // Real-time subscription will handle adding to state if successful
    } catch (error) {
      console.error('Error adding lead:', error);
      // Fall back to local addition
      const newLead: Lead = {
        ...leadData,
        id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dispatch({ type: 'ADD_LEAD', payload: newLead });
    }
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    // Update local state immediately for instant UI feedback
    dispatch({ type: 'UPDATE_LEAD', payload: { id, updates } });
    
    try {
      const { data, error } = await leadService.updateLead(id, updates);
      
      if (error) {
        console.error('Error updating lead in database:', error);
        // Could revert the local change here if needed
      }
      // Real-time subscription will sync any server-side changes
    } catch (error) {
      console.error('Error updating lead:', error);
      // Local state is already updated, so UI remains responsive
    }
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    try {
      const { error } = await leadService.deleteLead(id);
      
      if (error) {
        console.error('Error deleting lead:', error);
        // Fall back to local deletion
        dispatch({ type: 'DELETE_LEAD', payload: id });
      }
      // Real-time subscription will handle removing from state if successful
    } catch (error) {
      console.error('Error deleting lead:', error);
      // Fall back to local deletion
      dispatch({ type: 'DELETE_LEAD', payload: id });
    }
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setStatusFilter = useCallback((status: Lead['status'] | 'all') => {
    dispatch({ type: 'SET_STATUS_FILTER', payload: status });
  }, []);

  const setPriorityFilter = useCallback((priority: Lead['priority'] | 'all') => {
    dispatch({ type: 'SET_PRIORITY_FILTER', payload: priority });
  }, []);

  const setDateRangeFilter = useCallback((start: string | null, end: string | null) => {
    dispatch({ type: 'SET_DATE_RANGE_FILTER', payload: { start, end } });
  }, []);

  const setSortBy = useCallback((sortBy: SortOption) => {
    dispatch({ type: 'SET_SORT_BY', payload: sortBy });
  }, []);

  const setSortOrder = useCallback((order: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT_ORDER', payload: order });
  }, []);

  const clearFilters = useCallback(() => {
    dispatch({ type: 'CLEAR_FILTERS' });
  }, []);

  // Data getters
  const getLeadById = useCallback((id: string) => {
    return state.leads.find(lead => lead.id === id);
  }, [state.leads]);

  const getPhoneCallsByLeadId = useCallback((leadId: string) => {
    return state.phoneCalls.filter(call => call.lead_id === leadId);
  }, [state.phoneCalls]);

  const getEmailsByLeadId = useCallback((leadId: string) => {
    return state.emails.filter(email => email.lead_id === leadId);
  }, [state.emails]);

  const getEvaluationsByLeadId = useCallback((leadId: string) => {
    return state.evaluations.filter(evaluation => evaluation.lead_id === leadId);
  }, [state.evaluations]);

  // Memoize comments per lead to prevent infinite re-renders
  const commentsByLeadId = useMemo(() => {
    const grouped: { [leadId: string]: Comment[] } = {};
    state.comments.forEach(comment => {
      if (!grouped[comment.lead_id]) {
        grouped[comment.lead_id] = [];
      }
      grouped[comment.lead_id].push(comment);
    });
    return grouped;
  }, [state.comments]);

  const getCommentsByLeadId = useCallback((leadId: string) => {
    return commentsByLeadId[leadId] || [];
  }, [commentsByLeadId]);

  // Load comments for a lead when needed
  const loadCommentsForLead = useCallback(async (leadId: string) => {
    try {
      // Try Supabase first
      const { data, error } = await commentService.getCommentsByLeadId(leadId);
      
      if (!error && data) {
        const transformedComments = data.map(comment => ({
          id: comment.id,
          lead_id: comment.lead_id,
          user_id: comment.user_id,
          content: comment.comment_text,
          is_internal: comment.is_internal,
          created_at: comment.created_at,
          updated_at: comment.updated_at,
          parent_id: null,
          is_edited: comment.created_at !== comment.updated_at,
          user: comment.user
        }));
        
        // Update only comments for this lead
        dispatch({ type: 'SET_COMMENTS', payload: transformedComments });
        
        // Set up real-time subscription for this lead's comments
        const subscription = commentService.subscribeToComments(leadId, (payload) => {
          loadCommentsForLead(leadId); // Reload comments on any change
        });
        
        return () => subscription.unsubscribe();
      } else {
        // Fallback: Comments are already loaded from mock data, no need to reload
        console.log('📝 Comments already loaded from mock data for lead:', leadId);
      }
    } catch (error) {
      console.error('Error loading comments from Supabase, using mock data:', error);
      // Comments should already be loaded from mock data in the initial load
    }
  }, []);

  // Make loadCommentsForLead available globally for components
  React.useEffect(() => {
    (window as any).__loadCommentsForLead = loadCommentsForLead;
  }, [loadCommentsForLead]);

  // Comment operations - try Supabase first, fall back to mock service
  const addComment = useCallback(async (comment: Comment) => {
    try {
      // Try Supabase first
      const { data, error } = await commentService.createComment({
        lead_id: comment.lead_id,
        comment_text: comment.content,
        is_internal: comment.is_internal,
        user_id: comment.user_id
      });
      
      if (error) {
        throw new Error('Supabase failed, falling back to mock service');
      } else {
        // Reload comments for this lead
        loadCommentsForLead(comment.lead_id);
        return;
      }
    } catch (error) {
      console.log('Using mock comment service for adding comment');
      // Fall back to mock service and local state
      dispatch({ type: 'ADD_COMMENT', payload: comment });
    }
  }, [loadCommentsForLead]);

  const updateComment = useCallback(async (id: string, updates: Partial<Comment>) => {
    try {
      const { data, error } = await commentService.updateComment(id, {
        comment_text: updates.content,
        is_internal: updates.is_internal
      });
      
      if (error) {
        console.error('Error updating comment:', error);
        // Fall back to local update
        dispatch({ type: 'UPDATE_COMMENT', payload: { id, updates } });
      } else {
        // Find the lead_id from the comment and reload
        const comment = state.comments.find(c => c.id === id);
        if (comment) {
          loadCommentsForLead(comment.lead_id);
        }
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      // Fall back to local update
      dispatch({ type: 'UPDATE_COMMENT', payload: { id, updates } });
    }
  }, [state.comments, loadCommentsForLead]);

  const deleteComment = useCallback(async (id: string) => {
    try {
      // Find the lead_id from the comment
      const comment = state.comments.find(c => c.id === id);
      
      if (comment) {
        const { error } = await commentService.deleteComment(id);
        
        if (error) {
          console.error('Error deleting comment:', error);
          // Fall back to local deletion
          dispatch({ type: 'DELETE_COMMENT', payload: id });
        } else {
          loadCommentsForLead(comment.lead_id);
        }
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Fall back to local deletion
      dispatch({ type: 'DELETE_COMMENT', payload: id });
    }
  }, [state.comments, loadCommentsForLead]);

  const contextValue = useMemo(() => ({
    state,
    filteredLeads,
    addLead,
    updateLead,
    deleteLead,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setDateRangeFilter,
    setSortBy,
    setSortOrder,
    clearFilters,
    getLeadById,
    getPhoneCallsByLeadId,
    getEmailsByLeadId,
    getEvaluationsByLeadId,
    getCommentsByLeadId,
    addComment,
    updateComment,
    deleteComment,
  }), [
    state,
    filteredLeads,
    addLead,
    updateLead,
    deleteLead,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setDateRangeFilter,
    setSortBy,
    setSortOrder,
    clearFilters,
    getLeadById,
    getPhoneCallsByLeadId,
    getEmailsByLeadId,
    getEvaluationsByLeadId,
    getCommentsByLeadId,
    addComment,
    updateComment,
    deleteComment,
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export default DataContext;