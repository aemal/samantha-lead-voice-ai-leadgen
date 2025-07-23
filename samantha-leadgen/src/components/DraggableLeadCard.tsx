"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Lead } from "@/types";
import LeadCard from "./LeadCard";
import { useState } from "react";

interface DraggableLeadCardProps {
  lead: Lead;
  onLeadClick?: (lead: Lead) => void;
}

export default function DraggableLeadCard({
  lead,
  onLeadClick,
}: DraggableLeadCardProps) {
  const [isDragStarted, setIsDragStarted] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lead.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = () => {
    // Only trigger click if we're not in the middle of a drag operation
    if (!isDragStarted && onLeadClick) {
      onLeadClick(lead);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${
        isDragging ? "opacity-50 z-50" : ""
      } cursor-grab active:cursor-grabbing min-w-0 w-full`}
    >
      <LeadCard lead={lead} onClick={handleClick} />
    </div>
  );
}
