'use client';

import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import { SupabaseService } from '@/lib/supabase-client';
import type { Lead, PhoneCall, Email, Evaluation, Comment } from '@/lib/supabase';

// Action types
type DataAction = 
  | { type: 'SET_LOADING'; payload: boolean }
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
  | { type: 'SET_PHONE_CALLS'; payload: PhoneCall[] }
  | { type: 'ADD_PHONE_CALL'; payload: PhoneCall }
  | { type: 'SET_EMAILS'; payload: Email[] }
  | { type: 'ADD_EMAIL'; payload: Email }
  | { type: 'SET_EVALUATIONS'; payload: Evaluation[] }
  | { type: 'ADD_EVALUATION'; payload: Evaluation }
  | { type: 'SET_COMMENTS'; payload: Comment[] }
  | { type: 'ADD_COMMENT'; payload: Comment }
  | { type: 'UPDATE_COMMENT'; payload: { id: string; updates: Partial<Comment> } }
  | { type: 'DELETE_COMMENT'; payload: string }
  | { type: 'SET_ERROR'; payload: string | null };

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
  error: string | null;
}

interface DataContextType {
  state: DataState;
  filteredLeads: Lead[];
  // Lead operations
  addLead: (lead: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
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
  addComment: (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateComment: (id: string, updates: Partial<Comment>) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  // Refresh data
  refreshLeads: () => Promise<void>;
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
  error: null,
};

function dataReducer(state: DataState, action: DataAction): DataState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_LEADS':
      return { ...state, leads: action.payload, loading: false, error: null };
    
    case 'ADD_LEAD': {
      const newLeads = [...state.leads, action.payload];
      return { ...state, leads: newLeads };
    }
    
    case 'UPDATE_LEAD': {
      const updatedLeads = state.leads.map(lead =>
        lead.id === action.payload.id
          ? { ...lead, ...action.payload.updates }
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
    
    case 'SET_PHONE_CALLS':
      return { ...state, phoneCalls: action.payload };
    
    case 'ADD_PHONE_CALL':
      return { ...state, phoneCalls: [...state.phoneCalls, action.payload] };
    
    case 'SET_EMAILS':
      return { ...state, emails: action.payload };
    
    case 'ADD_EMAIL':
      return { ...state, emails: [...state.emails, action.payload] };
    
    case 'SET_EVALUATIONS':
      return { ...state, evaluations: action.payload };
    
    case 'ADD_EVALUATION':
      return { ...state, evaluations: [...state.evaluations, action.payload] };
    
    case 'SET_COMMENTS':
      return { ...state, comments: action.payload };
    
    case 'ADD_COMMENT': {
      const newComments = [...state.comments, action.payload];
      return { ...state, comments: newComments };
    }
    
    case 'UPDATE_COMMENT': {
      const updatedComments = state.comments.map(comment =>
        comment.id === action.payload.id
          ? { ...comment, ...action.payload.updates }
          : comment
      );
      return { ...state, comments: updatedComments };
    }
    
    case 'DELETE_COMMENT': {
      const filteredComments = state.comments.filter(comment => comment.id !== action.payload);
      return { ...state, comments: filteredComments };
    }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    default:
      return state;
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function SupabaseDataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const [leads, phoneCalls, emails, evaluations, comments] = await Promise.all([
        SupabaseService.getLeads(),
        SupabaseService.getPhoneCalls(),
        SupabaseService.getEmails(),
        SupabaseService.getEvaluations(),
        SupabaseService.getComments(),
      ]);

      dispatch({ type: 'SET_LEADS', payload: leads });
      dispatch({ type: 'SET_PHONE_CALLS', payload: phoneCalls });
      dispatch({ type: 'SET_EMAILS', payload: emails });
      dispatch({ type: 'SET_EVALUATIONS', payload: evaluations });
      dispatch({ type: 'SET_COMMENTS', payload: comments });
    } catch (error) {
      console.error('Error loading initial data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load data' });
    }
  }, []);

  // Initialize data and real-time subscriptions
  useEffect(() => {
    loadInitialData();

    // Set up real-time subscription for leads
    const leadsSubscription = SupabaseService.subscribeToLeads((payload) => {
      console.log('Real-time leads update:', payload);
      
      if (payload.eventType === 'INSERT') {
        dispatch({ type: 'ADD_LEAD', payload: payload.new });
      } else if (payload.eventType === 'UPDATE') {
        dispatch({ type: 'UPDATE_LEAD', payload: { id: payload.new.id, updates: payload.new } });
      } else if (payload.eventType === 'DELETE') {
        dispatch({ type: 'DELETE_LEAD', payload: payload.old.id });
      }
    });

    return () => {
      leadsSubscription.unsubscribe();
    };
  }, [loadInitialData]);

  // Memoized filtered and sorted leads
  const filteredLeads = useMemo(() => {
    let filtered = [...state.leads];

    // Apply search filter
    if (state.filters.searchQuery.trim()) {
      const query = state.filters.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lead =>
        lead.name.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query) ||
        (lead.phone && lead.phone.includes(query)) ||
        (lead.notes && lead.notes.toLowerCase().includes(query)) ||
        (lead.source && lead.source.toLowerCase().includes(query))
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

  // Action creators
  const addLead = useCallback(async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newLead = await SupabaseService.createLead(leadData);
      dispatch({ type: 'ADD_LEAD', payload: newLead });
    } catch (error) {
      console.error('Error adding lead:', error);
      throw error;
    }
  }, []);

  const updateLead = useCallback(async (id: string, updates: Partial<Lead>) => {
    try {
      const updatedLead = await SupabaseService.updateLead(id, updates);
      dispatch({ type: 'UPDATE_LEAD', payload: { id, updates: updatedLead } });
    } catch (error) {
      console.error('Error updating lead:', error);
      throw error;
    }
  }, []);

  const deleteLead = useCallback(async (id: string) => {
    try {
      await SupabaseService.deleteLead(id);
      dispatch({ type: 'DELETE_LEAD', payload: id });
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }, []);

  const refreshLeads = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const leads = await SupabaseService.getLeads();
      dispatch({ type: 'SET_LEADS', payload: leads });
    } catch (error) {
      console.error('Error refreshing leads:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to refresh leads' });
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

  const getCommentsByLeadId = useCallback((leadId: string) => {
    return state.comments.filter(comment => comment.lead_id === leadId);
  }, [state.comments]);

  // Comment operations
  const addComment = useCallback(async (commentData: Omit<Comment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newComment = await SupabaseService.createComment(commentData);
      dispatch({ type: 'ADD_COMMENT', payload: newComment });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }, []);

  const updateComment = useCallback(async (id: string, updates: Partial<Comment>) => {
    try {
      const updatedComment = await SupabaseService.updateComment(id, updates);
      dispatch({ type: 'UPDATE_COMMENT', payload: { id, updates: updatedComment } });
    } catch (error) {
      console.error('Error updating comment:', error);
      throw error;
    }
  }, []);

  const deleteComment = useCallback(async (id: string) => {
    try {
      await SupabaseService.deleteComment(id);
      dispatch({ type: 'DELETE_COMMENT', payload: id });
    } catch (error) {
      console.error('Error deleting comment:', error);
      throw error;
    }
  }, []);

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
    refreshLeads,
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
    refreshLeads,
  ]);

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  );
}

export function useSupabaseData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useSupabaseData must be used within a SupabaseDataProvider');
  }
  return context;
}

export default DataContext;