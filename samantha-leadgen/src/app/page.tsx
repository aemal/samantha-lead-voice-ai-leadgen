'use client';

import { useState } from 'react';
import KanbanBoard from '@/components/KanbanBoard';
import AddLeadModal from '@/components/AddLeadModal';
import { PlusIcon } from '@heroicons/react/24/outline';
import { Lead } from '@/types';

export default function Home() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleAddLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at'>) => {
    // For now, we'll just trigger a refresh - in a real app this would call an API
    console.log('Adding new lead:', leadData);
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Lead Management Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
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
        
        <KanbanBoard key={refreshTrigger} />
        
        <AddLeadModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddLead}
        />
      </div>
    </main>
  );
}
