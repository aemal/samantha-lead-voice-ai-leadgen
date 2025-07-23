'use client';

import { useState } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import AddLeadModal from '@/components/AddLeadModal';
import SearchAndFilterBar from '@/components/SearchAndFilterBar';
import Header from '@/components/Header';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Lead } from '@/types';
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const { addLead } = useData();
  const { user, loading } = useAuth();

  const handleAddLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      await addLead(leadData);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Error adding lead:', error);
      // TODO: Show error message to user
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Lead Management</h1>
          <p className="text-gray-600 mb-4">Please sign in to continue</p>
          <a 
            href="/auth/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Lead Management Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and track your sales leads through the pipeline
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Lead
          </button>
        </div>
        
        <SearchAndFilterBar />
        <KanbanBoard />
        
        <AddLeadModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddLead}
        />
      </div>
      </main>
    </div>
  );
}
