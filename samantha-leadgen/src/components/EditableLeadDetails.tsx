'use client';

import { useState, useEffect } from 'react';
import { Lead } from '@/types';
import { useData } from '@/contexts/DataContext';
import { UserIcon, EnvelopeIcon, PhoneIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface EditableLeadDetailsProps {
  lead: Lead;
}

const statusColors = {
  lead: 'bg-blue-100 text-blue-800',
  qualified: 'bg-green-100 text-green-800',
  appointment_booked: 'bg-purple-100 text-purple-800',
  disqualified: 'bg-red-100 text-red-800'
};

const priorityColors = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
};

export default function EditableLeadDetails({ lead }: EditableLeadDetailsProps) {
  const { updateLead } = useData();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [editValues, setEditValues] = useState({
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    source: lead.source,
    notes: lead.notes,
    status: lead.status,
    priority: lead.priority
  });

  // Update editValues when lead prop changes
  useEffect(() => {
    setEditValues({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      notes: lead.notes,
      status: lead.status,
      priority: lead.priority
    });
  }, [lead]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleEdit = (field: string) => {
    setIsEditing(field);
    setEditValues({
      ...editValues,
      [field]: lead[field as keyof Lead]
    });
  };

  const handleSave = async (field: string) => {
    const value = editValues[field as keyof typeof editValues];
    await updateLead(lead.id, { [field]: value });
    setIsEditing(null);
  };

  const handleCancel = () => {
    setIsEditing(null);
    setEditValues({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      source: lead.source,
      notes: lead.notes,
      status: lead.status,
      priority: lead.priority
    });
  };

  const EditableField = ({ field, icon: Icon, value }: { field: string; icon?: any; value: string }) => {
    const isCurrentlyEditing = isEditing === field;
    
    return (
      <div className="flex items-center space-x-3 group">
        {Icon && <Icon className="w-5 h-5 text-gray-400" />}
        {isCurrentlyEditing ? (
          <div className="flex-1 flex items-center space-x-2">
            <input
              type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
              className="flex-1 px-2 py-1 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={editValues[field as keyof typeof editValues]}
              onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
              autoFocus
            />
            <button
              onClick={() => handleSave(field)}
              className="p-1 text-green-600 hover:text-green-700"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-600 hover:text-red-700"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <span className="text-sm text-gray-900 flex-1">{value}</span>
            <button
              onClick={() => handleEdit(field)}
              className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  const EditableSelect = ({ field, options, value }: { field: string; options: string[]; value: string }) => {
    const isCurrentlyEditing = isEditing === field;
    
    return (
      <div className="flex items-center space-x-2 group">
        {isCurrentlyEditing ? (
          <div className="flex items-center space-x-2">
            <select
              value={editValues[field as keyof typeof editValues]}
              onChange={(e) => {
                setEditValues({ ...editValues, [field]: e.target.value });
              }}
              className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              aria-label={`Edit ${field}`}
            >
              {options.map((option) => (
                <option key={option} value={option}>
                  {option.replace(/_/g, ' ').toUpperCase()}
                </option>
              ))}
            </select>
            <button
              onClick={() => handleSave(field)}
              className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
            >
              <CheckIcon className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              field === 'status' ? statusColors[value as Lead['status']] : priorityColors[value as Lead['priority']]
            }`}>
              {value.replace('_', ' ').toUpperCase()}{field === 'priority' ? ' PRIORITY' : ''}
            </span>
            <button
              onClick={() => handleEdit(field)}
              className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status and Priority */}
      <div className="flex space-x-4">
        <EditableSelect 
          field="status" 
          options={['lead', 'qualified', 'appointment_booked', 'disqualified']} 
          value={lead.status} 
        />
        <EditableSelect 
          field="priority" 
          options={['low', 'medium', 'high']} 
          value={lead.priority} 
        />
      </div>

      {/* Contact Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
        <div className="space-y-3">
          <EditableField field="name" icon={UserIcon} value={lead.name} />
          <EditableField field="email" icon={EnvelopeIcon} value={lead.email} />
          <EditableField field="phone" icon={PhoneIcon} value={lead.phone} />
        </div>
      </div>

      {/* Lead Source */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Lead Source</h3>
        <div className="group">
          {isEditing === 'source' ? (
            <div className="flex items-center space-x-2">
              <select
                value={editValues.source}
                onChange={(e) => {
                  setEditValues({ ...editValues, source: e.target.value as Lead['source'] });
                }}
                className="w-48 px-3 py-2 text-sm border border-gray-300 rounded-md bg-white text-gray-700 focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
                aria-label="Edit source"
              >
                <option value="website_form">Website Form</option>
                <option value="phone_call">Phone Call</option>
                <option value="email_campaign">Email Campaign</option>
                <option value="social_media">Social Media</option>
                <option value="referral">Referral</option>
                <option value="partner">Partner</option>
                <option value="trade_show">Trade Show</option>
                <option value="other">Other</option>
              </select>
              <button
                onClick={() => handleSave('source')}
                className="inline-flex items-center justify-center w-8 h-8 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md transition-colors"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <p className="text-sm text-gray-600 capitalize">{lead.source.replace(/_/g, ' ')}</p>
              <button
                onClick={() => handleEdit('source')}
                className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Timeline</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Created: {formatDate(lead.created_at)}</p>
          <p>Last Updated: {formatDate(lead.updated_at)}</p>
        </div>
      </div>

      {/* Notes */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
        <div className="group">
          {isEditing === 'notes' ? (
            <div className="space-y-2">
              <textarea
                className="w-full px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={editValues.notes}
                onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                rows={4}
                autoFocus
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => handleSave('notes')}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400 flex justify-between items-start">
              <p className="text-sm text-gray-800 leading-relaxed flex-1">
                {lead.notes || 'No notes yet'}
              </p>
              <button
                onClick={() => handleEdit('notes')}
                className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}