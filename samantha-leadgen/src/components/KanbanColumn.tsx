'use client';

import { Lead } from '@/types';
import DraggableLeadCard from './DraggableLeadCard';
import { useDroppable } from '@dnd-kit/core';

interface KanbanColumnProps {
  title: string;
  status: Lead['status'];
  leads: Lead[];
  count: number;
  color: 'blue' | 'green' | 'purple' | 'red';
  isDragOver?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    header: 'bg-blue-100',
    badge: 'bg-blue-500',
    dragOver: 'bg-blue-100 border-blue-400'
  },
  green: {
    bg: 'bg-green-50',
    border: 'border-green-200', 
    header: 'bg-green-100',
    badge: 'bg-green-500',
    dragOver: 'bg-green-100 border-green-400'
  },
  purple: {
    bg: 'bg-purple-50',
    border: 'border-purple-200', 
    header: 'bg-purple-100',
    badge: 'bg-purple-500',
    dragOver: 'bg-purple-100 border-purple-400'
  },
  red: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    header: 'bg-red-100',
    badge: 'bg-red-500',
    dragOver: 'bg-red-100 border-red-400'
  }
};

export default function KanbanColumn({ title, status, leads, count, color, isDragOver }: KanbanColumnProps) {
  const classes = colorClasses[color];
  const { setNodeRef } = useDroppable({
    id: status,
  });

  return (
    <div 
      ref={setNodeRef}
      className={`flex-1 ${isDragOver ? classes.dragOver : `${classes.bg} ${classes.border}`} border-2 border-dashed rounded-lg h-full transition-all duration-200`}
    >
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
            <p className="text-sm">
              {isDragOver ? 'Drop lead here' : 'No leads in this column'}
            </p>
          </div>
        ) : (
          leads.map(lead => (
            <DraggableLeadCard key={lead.id} lead={lead} />
          ))
        )}
        
        {/* Drop zone indicator when dragging over empty space */}
        {isDragOver && leads.length > 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 mt-3">
            <p className="text-center text-gray-500 text-sm">Drop here</p>
          </div>
        )}
      </div>
    </div>
  );
}