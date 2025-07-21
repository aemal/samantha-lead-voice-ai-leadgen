'use client';

import { Lead } from '@/types';
import { Phone, Mail, Calendar, User } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
}

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

const priorityLabels = {
  low: 'Low',
  medium: 'Medium', 
  high: 'High'
};

export default function LeadCard({ lead }: LeadCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-gray-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900 text-sm">{lead.name}</h3>
            <p className="text-xs text-gray-500">{lead.source.replace('_', ' ')}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColors[lead.priority]}`}>
          {priorityLabels[lead.priority]}
        </span>
      </div>

      <div className="space-y-2 mb-3">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Mail className="w-3 h-3" />
          <span className="truncate">{lead.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Phone className="w-3 h-3" />
          <span>{lead.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Calendar className="w-3 h-3" />
          <span>Created {formatDate(lead.created_at)}</span>
        </div>
      </div>

      {lead.notes && (
        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
          <p className="line-clamp-2">{lead.notes}</p>
        </div>
      )}
    </div>
  );
}