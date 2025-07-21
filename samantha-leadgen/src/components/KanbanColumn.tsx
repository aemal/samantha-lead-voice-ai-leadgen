'use client';

import { Lead } from '@/types';
import LeadCard from './LeadCard';

interface KanbanColumnProps {
  title: string;
  status: Lead['status'];
  leads: Lead[];
  count: number;
  color: 'blue' | 'green' | 'red';
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-100',
    badge: 'bg-blue-500'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200', 
    header: 'bg-green-100',
    badge: 'bg-green-500'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    header: 'bg-red-100',
    badge: 'bg-red-500'
  }
};

export default function KanbanColumn({ title, status, leads, count, color }: KanbanColumnProps) {
  const classes = colorClasses[color];

  return (
    <div className={`flex-1 ${classes.bg} ${classes.border} border rounded-lg h-full`}>
      <div className={`${classes.header} px-4 py-3 border-b ${classes.border} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <span className={`${classes.badge} text-white text-xs px-2 py-1 rounded-full`}>
            {count}
          </span>
        </div>
      </div>
      
      <div className="p-4 space-y-3 max-h-[calc(100vh-16rem)] overflow-y-auto">
        {leads.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No leads in this column</p>
          </div>
        ) : (
          leads.map(lead => (
            <LeadCard key={lead.id} lead={lead} />
          ))
        )}
      </div>
    </div>
  );
}