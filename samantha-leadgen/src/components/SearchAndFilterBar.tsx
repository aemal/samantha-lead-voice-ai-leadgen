'use client';

import { useState, useCallback, useEffect } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon, ChevronDownIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/outline';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { Lead } from '@/lib/supabase';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

const statusOptions = [
  { value: 'all', label: 'All Statuses', color: 'text-gray-600' },
  { value: 'lead', label: 'Lead', color: 'text-blue-600' },
  { value: 'qualified', label: 'Qualified', color: 'text-green-600' },
  { value: 'appointment_booked', label: 'Appointment Booked', color: 'text-purple-600' },
  { value: 'disqualified', label: 'Disqualified', color: 'text-red-600' },
];

const priorityOptions = [
  { value: 'all', label: 'All Priorities', color: 'text-gray-600' },
  { value: 'low', label: 'Low Priority', color: 'text-gray-600' },
  { value: 'medium', label: 'Medium Priority', color: 'text-yellow-600' },
  { value: 'high', label: 'High Priority', color: 'text-red-600' },
];

const sortOptions = [
  { value: 'updated_at', label: 'Last Updated' },
  { value: 'created_at', label: 'Date Created' },
  { value: 'name', label: 'Name' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
];

export default function SearchAndFilterBar() {
  const {
    state,
    filteredLeads,
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setDateRangeFilter,
    setSortBy,
    setSortOrder,
    clearFilters,
  } = useSupabaseData();

  const [searchInput, setSearchInput] = useState(state.filters.searchQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState(state.filters.dateRangeFilter.start || '');
  const [endDate, setEndDate] = useState(state.filters.dateRangeFilter.end || '');

  const debouncedSearchQuery = useDebounce(searchInput, 300);

  useEffect(() => {
    setSearchQuery(debouncedSearchQuery);
  }, [debouncedSearchQuery, setSearchQuery]);

  const handleClearFilters = useCallback(() => {
    setSearchInput('');
    setStartDate('');
    setEndDate('');
    clearFilters();
    setShowFilters(false);
  }, [clearFilters]);

  const handleDateRangeChange = useCallback((start: string, end: string) => {
    setStartDate(start);
    setEndDate(end);
    setDateRangeFilter(start || null, end || null);
  }, [setDateRangeFilter]);

  const toggleSortOrder = useCallback(() => {
    setSortOrder(state.filters.sortOrder === 'asc' ? 'desc' : 'asc');
  }, [setSortOrder, state.filters.sortOrder]);

  const activeFiltersCount = [
    state.filters.searchQuery,
    state.filters.statusFilter !== 'all',
    state.filters.priorityFilter !== 'all',
    state.filters.dateRangeFilter.start || state.filters.dateRangeFilter.end,
  ].filter(Boolean).length;

  const selectedStatusLabel = statusOptions.find(option => option.value === state.filters.statusFilter)?.label || 'All Statuses';
  const selectedPriorityLabel = priorityOptions.find(option => option.value === state.filters.priorityFilter)?.label || 'All Priorities';
  const selectedSortLabel = sortOptions.find(option => option.value === state.filters.sortBy)?.label || 'Last Updated';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-6">
      {/* Main search and controls row */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search input */}
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search leads by name, email, phone, or notes..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </button>
          )}
        </div>

        {/* Filter toggle and sort */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium ${
              activeFiltersCount > 0
                ? 'text-indigo-700 bg-indigo-50 border-indigo-200'
                : 'text-gray-700 bg-white hover:bg-gray-50'
            } transition-colors`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Sort dropdown */}
          <div className="relative">
            <select
              value={state.filters.sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none cursor-pointer"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  Sort by {option.label}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Sort order toggle */}
          <button
            onClick={toggleSortOrder}
            className="inline-flex items-center px-2 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            title={`Sort ${state.filters.sortOrder === 'asc' ? 'ascending' : 'descending'}`}
          >
            {state.filters.sortOrder === 'asc' ? (
              <ArrowUpIcon className="h-4 w-4" />
            ) : (
              <ArrowDownIcon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="mt-3 text-sm text-gray-600">
        Showing {filteredLeads.length} of {state.leads.length} leads
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={state.filters.statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Lead['status'] | 'all')}
                className="block w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                value={state.filters.priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as Lead['priority'] | 'all')}
                className="block w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Date range start */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => handleDateRangeChange(e.target.value, endDate)}
                className="block w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
              />
            </div>

            {/* Date range end */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => handleDateRangeChange(startDate, e.target.value)}
                className="block w-full px-3 py-2 text-gray-900 bg-white border border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none sm:text-sm"
              />
            </div>
          </div>

          {/* Clear filters button */}
          {activeFiltersCount > 0 && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <XMarkIcon className="h-4 w-4 mr-1" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Active filter tags */}
      {activeFiltersCount > 0 && !showFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {state.filters.searchQuery && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Search: "{state.filters.searchQuery}"
              <button
                onClick={() => setSearchInput('')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {state.filters.statusFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Status: {selectedStatusLabel}
              <button
                onClick={() => setStatusFilter('all')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-green-200"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {state.filters.priorityFilter !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Priority: {selectedPriorityLabel}
              <button
                onClick={() => setPriorityFilter('all')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-yellow-200"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {(state.filters.dateRangeFilter.start || state.filters.dateRangeFilter.end) && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Date: {state.filters.dateRangeFilter.start || '...'} to {state.filters.dateRangeFilter.end || '...'}
              <button
                onClick={() => handleDateRangeChange('', '')}
                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-purple-200"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}