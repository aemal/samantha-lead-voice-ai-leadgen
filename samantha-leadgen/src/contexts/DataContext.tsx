'use client';

import React, { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import { Lead, MockData, PhoneCall, Email, Evaluation, Comment } from '@/types';
import mockDataJson from '@/data/mock.json';

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
  | { type: 'DELETE_COMMENT'; payload: string };

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
    
    default:
      return state;
  }
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Initialize data
  useEffect(() => {
    const mockData = mockDataJson as MockData;
    dispatch({ type: 'SET_LEADS', payload: mockData.leads });
    // Convert mock comments to new format and set them
    const convertedComments = mockData.comments.map(comment => ({
      id: comment.id,
      lead_id: comment.lead_id,
      user_id: comment.user_id,
      content: comment.comment_text,
      is_internal: comment.is_internal,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      parent_id: comment.parent_comment_id,
      is_edited: false
    }));
    dispatch({ type: 'SET_COMMENTS', payload: convertedComments });
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

  // Action creators
  const addLead = useCallback((leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    const newLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_LEAD', payload: newLead });
  }, []);

  const updateLead = useCallback((id: string, updates: Partial<Lead>) => {
    dispatch({ type: 'UPDATE_LEAD', payload: { id, updates } });
  }, []);

  const deleteLead = useCallback((id: string) => {
    dispatch({ type: 'DELETE_LEAD', payload: id });
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

  const mockData = mockDataJson as MockData;

  const getPhoneCallsByLeadId = useCallback((leadId: string) => {
    return mockData.phone_calls.filter(call => call.lead_id === leadId);
  }, []);

  const getEmailsByLeadId = useCallback((leadId: string) => {
    return mockData.emails.filter(email => email.lead_id === leadId);
  }, []);

  const getEvaluationsByLeadId = useCallback((leadId: string) => {
    return mockData.evaluations.filter(evaluation => evaluation.lead_id === leadId);
  }, []);

  const getCommentsByLeadId = useCallback((leadId: string) => {
    return state.comments.filter(comment => comment.lead_id === leadId);
  }, [state.comments]);

  // Comment operations
  const addComment = useCallback((comment: Comment) => {
    dispatch({ type: 'ADD_COMMENT', payload: comment });
  }, []);

  const updateComment = useCallback((id: string, updates: Partial<Comment>) => {
    dispatch({ type: 'UPDATE_COMMENT', payload: { id, updates } });
  }, []);

  const deleteComment = useCallback((id: string) => {
    dispatch({ type: 'DELETE_COMMENT', payload: id });
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