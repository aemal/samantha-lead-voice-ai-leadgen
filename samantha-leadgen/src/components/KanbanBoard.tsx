'use client';

import { useState, useEffect } from 'react';
import { Lead, MockData } from '@/types';
import KanbanColumn from './KanbanColumn';
import mockData from '@/data/mock.json';
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

const COLUMN_STATUS: Lead['status'][] = ['lead', 'qualified', 'appointment_booked', 'disqualified'];

export default function KanbanBoard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

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

  const getActiveLead = () => {
    return leads.find(lead => lead.id === activeId);
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
      const activeLead = leads.find(lead => lead.id === activeId);
      if (activeLead && activeLead.status !== overId) {
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === activeId
              ? { ...lead, status: overId as Lead['status'], updated_at: new Date().toISOString() }
              : lead
          )
        );
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
      const activeLead = leads.find(lead => lead.id === activeId);
      if (activeLead && activeLead.status !== overId) {
        setLeads(prevLeads =>
          prevLeads.map(lead =>
            lead.id === activeId
              ? { ...lead, status: overId as Lead['status'], updated_at: new Date().toISOString() }
              : lead
          )
        );
      }
      return;
    }

    // Handle reordering within the same status
    const overLead = leads.find(lead => lead.id === overId);
    const activeLead = leads.find(lead => lead.id === activeId);

    if (!overLead || !activeLead) return;

    if (activeLead.status === overLead.status) {
      const activeIndex = leads.findIndex(lead => lead.id === activeId);
      const overIndex = leads.findIndex(lead => lead.id === overId);

      if (activeIndex !== overIndex) {
        setLeads(prevLeads => arrayMove(prevLeads, activeIndex, overIndex));
      }
    } else {
      // Moving to different status
      setLeads(prevLeads =>
        prevLeads.map(lead =>
          lead.id === activeId
            ? { ...lead, status: overLead.status, updated_at: new Date().toISOString() }
            : lead
        )
      );
    }
  };

  if (loading) {
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
        <SortableContext items={leads.map(lead => lead.id)}>
          <KanbanColumn
            title="Leads"
            status="lead"
            leads={getLeadsByStatus('lead')}
            count={getLeadCount('lead')}
            color="blue"
            isDragOver={overId === 'lead'}
          />
          <KanbanColumn
            title="Qualified"
            status="qualified"
            leads={getLeadsByStatus('qualified')}
            count={getLeadCount('qualified')}
            color="green"
            isDragOver={overId === 'qualified'}
          />
          <KanbanColumn
            title="Appointment Booked"
            status="appointment_booked"
            leads={getLeadsByStatus('appointment_booked')}
            count={getLeadCount('appointment_booked')}
            color="purple"
            isDragOver={overId === 'appointment_booked'}
          />
          <KanbanColumn
            title="Disqualified"
            status="disqualified"
            leads={getLeadsByStatus('disqualified')}
            count={getLeadCount('disqualified')}
            color="red"
            isDragOver={overId === 'disqualified'}
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
    </DndContext>
  );
}