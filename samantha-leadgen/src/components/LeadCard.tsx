"use client";

import { Lead } from "@/types";
import {
  Phone,
  Mail,
  Calendar,
  User,
  MessageSquare,
  PhoneCall,
  CheckCircle,
} from "lucide-react";
import { useMemo } from "react";
import { useData } from "@/contexts/DataContext";

interface LeadCardProps {
  lead: Lead;
  onClick?: () => void;
}

const priorityColors = {
  low: "bg-gray-100 text-gray-800 border-gray-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-red-100 text-red-800 border-red-300",
};

const statusColors = {
  lead: "bg-blue-100 text-blue-800",
  qualified: "bg-green-100 text-green-800",
  appointment_booked: "bg-purple-100 text-purple-800",
  disqualified: "bg-red-100 text-red-800",
};

const priorityLabels = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function LeadCard({ lead, onClick }: LeadCardProps) {
  const {
    getCommentsByLeadId,
    getPhoneCallsByLeadId,
    getEmailsByLeadId,
    getEvaluationsByLeadId,
  } = useData();

  // Guard clause to prevent crashes when lead is undefined
  if (!lead) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="text-gray-500 text-center">Lead data not available</div>
      </div>
    );
  }

  const communicationStats = useMemo(() => {
    const phoneCalls = getPhoneCallsByLeadId(lead.id);
    const emails = getEmailsByLeadId(lead.id);
    const comments = getCommentsByLeadId(lead.id);
    const evaluations = getEvaluationsByLeadId(lead.id);

    const latestCall =
      phoneCalls.length > 0
        ? phoneCalls.sort(
            (a, b) =>
              new Date(b.call_date).getTime() - new Date(a.call_date).getTime()
          )[0]
        : null;
    const latestEmail =
      emails.length > 0
        ? emails.sort(
            (a, b) =>
              new Date(b.sent_at || b.created_at).getTime() -
              new Date(a.sent_at || a.created_at).getTime()
          )[0]
        : null;

    return {
      phoneCallsCount: phoneCalls.length,
      emailsCount: emails.length,
      commentsCount: comments.length,
      hasEvaluation: evaluations.length > 0,
      qualificationScore: evaluations[0]?.qualification_score || 0,
      latestCallOutcome: latestCall?.call_outcome,
      latestEmailStatus: latestEmail?.email_status,
      lastActivity: Math.max(
        latestCall ? new Date(latestCall.call_date).getTime() : 0,
        latestEmail ? new Date(latestEmail.sent_at).getTime() : 0,
        new Date(lead.updated_at).getTime()
      ),
    };
  }, [
    lead.id,
    lead.updated_at,
    getCommentsByLeadId,
    getPhoneCallsByLeadId,
    getEmailsByLeadId,
    getEvaluationsByLeadId,
  ]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = new Date().getTime();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (hours < 48) return "Yesterday";
    return Math.floor(hours / 24) + "d ago";
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-lg hover:border-gray-300 transition-all duration-200 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 lead-card-container"
      tabIndex={0}
      role="button"
      aria-label={`Lead: ${lead.name} - ${lead.status}`}
      onClick={onClick}
    >
      {/* Header with avatar and priority */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm">
              <User className="w-5 h-5 text-white" />
            </div>
            {lead.status === "appointment_booked" && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h3
              className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors block w-full overflow-hidden text-ellipsis whitespace-nowrap"
              title={lead.name}
            >
              {lead.name}
            </h3>
            <p
              className="text-xs text-gray-500 capitalize truncate block w-full overflow-hidden text-ellipsis whitespace-nowrap"
              title={lead.source.replace(/_/g, " ")}
            >
              {lead.source.replace(/_/g, " ")}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium border ${
              priorityColors[lead.priority]
            }`}
          >
            {priorityLabels[lead.priority]}
          </span>
          {communicationStats.hasEvaluation && (
            <div className="text-xs text-gray-500">
              Score: {communicationStats.qualificationScore}
            </div>
          )}
        </div>
      </div>

      {/* Communication indicators */}
      <div className="flex items-center space-x-4 mb-3 text-xs">
        <div className="flex items-center space-x-1">
          <PhoneCall
            className={`w-3 h-3 ${
              communicationStats.phoneCallsCount > 0
                ? "text-green-600"
                : "text-gray-400"
            }`}
          />
          <span
            className={
              communicationStats.phoneCallsCount > 0
                ? "text-green-600"
                : "text-gray-400"
            }
          >
            {communicationStats.phoneCallsCount}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <Mail
            className={`w-3 h-3 ${
              communicationStats.emailsCount > 0
                ? "text-blue-600"
                : "text-gray-400"
            }`}
          />
          <span
            className={
              communicationStats.emailsCount > 0
                ? "text-blue-600"
                : "text-gray-400"
            }
          >
            {communicationStats.emailsCount}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <MessageSquare
            className={`w-3 h-3 ${
              communicationStats.commentsCount > 0
                ? "text-purple-600"
                : "text-gray-400"
            }`}
          />
          <span
            className={
              communicationStats.commentsCount > 0
                ? "text-purple-600"
                : "text-gray-400"
            }
          >
            {communicationStats.commentsCount}
          </span>
        </div>
        <div className="flex-1 text-right text-gray-500">
          {formatRelativeTime(communicationStats.lastActivity)}
        </div>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Mail className="w-3 h-3 flex-shrink-0" />
          <span className="truncate" title={lead.email}>
            {lead.email}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Phone className="w-3 h-3 flex-shrink-0" />
          <span className="truncate" title={lead.phone}>
            {lead.phone}
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          <span>Created {formatDate(lead.created_at)}</span>
        </div>
      </div>

      {/* Status indicators */}
      {(communicationStats.latestCallOutcome ||
        communicationStats.latestEmailStatus) && (
        <div className="flex space-x-2 mb-3">
          {communicationStats.latestCallOutcome && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              <PhoneCall className="w-3 h-3 mr-1" />
              {communicationStats.latestCallOutcome.replace("_", " ")}
            </span>
          )}
          {communicationStats.latestEmailStatus && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              <Mail className="w-3 h-3 mr-1" />
              {communicationStats.latestEmailStatus}
            </span>
          )}
        </div>
      )}

      {/* Notes */}
      {lead.notes && (
        <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-md border-l-2 border-blue-200">
          <p className="line-clamp-2 leading-relaxed" title={lead.notes}>
            {lead.notes}
          </p>
        </div>
      )}
    </div>
  );
}
