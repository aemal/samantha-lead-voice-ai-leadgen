'use client';

import { useState } from 'react';
import { Lead } from '@/types';
import KanbanColumn from './KanbanColumn';
import { useData } from '@/contexts/DataContext';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  DragOverEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import LeadCard from './LeadCard';
import LeadDetailsDrawer from './LeadDetailsDrawer';

const COLUMN_STATUS: Lead['status'][] = ['lead', 'qualified', 'appointment_booked', 'disqualified'];

export default function KanbanBoard() {
  const { state, filteredLeads, updateLead } = useData();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getLeadsByStatus = (status: Lead['status']) => {
    return filteredLeads.filter(lead => lead.status === status);
  };

  const getLeadCount = (status: Lead['status']) => {
    return getLeadsByStatus(status).length;
  };

  const getActiveLead = () => {
    return filteredLeads.find(lead => lead.id === activeId);
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedLead(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString());
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) {
      setOverId(null);
      return;
    }

    const activeId = active.id.toString();
    const overId = over.id.toString();

    setOverId(overId);

    // If dropping on a column (not another lead)
    if (COLUMN_STATUS.includes(overId as Lead['status'])) {
      const activeLead = filteredLeads.find(lead => lead.id === activeId);
      if (activeLead && activeLead.status !== overId) {
        updateLead(activeId, { status: overId as Lead['status'] });
      }
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveId(null);
    setOverId(null);

    if (!over) return;

    const activeId = active.id.toString();
    const overId = over.id.toString();

    // Handle dropping on column
    if (COLUMN_STATUS.includes(overId as Lead['status'])) {
      const activeLead = filteredLeads.find(lead => lead.id === activeId);
      if (activeLead && activeLead.status !== overId) {
        updateLead(activeId, { status: overId as Lead['status'] });
      }
      return;
    }

    // Handle reordering within the same status
    const overLead = filteredLeads.find(lead => lead.id === overId);
    const activeLead = filteredLeads.find(lead => lead.id === activeId);

    if (!overLead || !activeLead) return;

    if (activeLead.status === overLead.status) {
      // For now, we'll just update the status to trigger a re-render
      // In a real app, you might want to handle ordering separately
      updateLead(activeId, { status: activeLead.status });
    } else {
      // Moving to different status
      updateLead(activeId, { status: overLead.status });
    }
  };

  if (state.loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        <SortableContext items={filteredLeads.map(lead => lead.id)}>
          <KanbanColumn
            title="Leads"
            status="lead"
            leads={getLeadsByStatus('lead')}
            count={getLeadCount('lead')}
            color="blue"
            isDragOver={overId === 'lead'}
            onLeadClick={handleLeadClick}
          />
          <KanbanColumn
            title="Qualified"
            status="qualified"
            leads={getLeadsByStatus('qualified')}
            count={getLeadCount('qualified')}
            color="green"
            isDragOver={overId === 'qualified'}
            onLeadClick={handleLeadClick}
          />
          <KanbanColumn
            title="Appointment Booked"
            status="appointment_booked"
            leads={getLeadsByStatus('appointment_booked')}
            count={getLeadCount('appointment_booked')}
            color="purple"
            isDragOver={overId === 'appointment_booked'}
            onLeadClick={handleLeadClick}
          />
          <KanbanColumn
            title="Disqualified"
            status="disqualified"
            leads={getLeadsByStatus('disqualified')}
            count={getLeadCount('disqualified')}
            color="red"
            isDragOver={overId === 'disqualified'}
            onLeadClick={handleLeadClick}
          />
        </SortableContext>
      </div>

      <DragOverlay>
        {activeId ? (
          <div className="rotate-3 opacity-90">
            <LeadCard lead={getActiveLead()!} />
          </div>
        ) : null}
      </DragOverlay>
      
      <LeadDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={handleDrawerClose}
        lead={selectedLead}
      />
    </DndContext>
  );
}