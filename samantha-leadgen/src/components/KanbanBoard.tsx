'use client';

import { useState, useEffect } from 'react';
import { Lead, MockData } from '@/types';
import KanbanColumn from './KanbanColumn';
import mockData from '@/data/mock.json';

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay
    setTimeout(() => {
      setLeads((mockData as MockData).leads);
      setLoading(false);
    }, 500);
  }, []);

  const getLeadsByStatus = (status: Lead['status']) => {
    return leads.filter(lead => lead.status === status);
  };

  const getLeadCount = (status: Lead['status']) => {
    return getLeadsByStatus(status).length;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <KanbanColumn
        title="Leads"
        status="lead"
        leads={getLeadsByStatus('lead')}
        count={getLeadCount('lead')}
        color="blue"
      />
      <KanbanColumn
        title="Qualified"
        status="qualified"
        leads={getLeadsByStatus('qualified')}
        count={getLeadCount('qualified')}
        color="green"
      />
      <KanbanColumn
        title="Disqualified"
        status="disqualified"
        leads={getLeadsByStatus('disqualified')}
        count={getLeadCount('disqualified')}
        color="red"
      />
    </div>
  );
}