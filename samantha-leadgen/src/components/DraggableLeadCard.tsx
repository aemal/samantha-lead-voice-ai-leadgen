'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/types';
import LeadCard from './LeadCard';

interface DraggableLeadCardProps {
  lead: Lead;
}

export default function DraggableLeadCard({ lead }: DraggableLeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lead.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'opacity-50 z-50' : ''} cursor-grab active:cursor-grabbing`}
    >
      <LeadCard lead={lead} />
    </div>
  );
}