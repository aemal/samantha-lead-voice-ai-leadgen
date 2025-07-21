'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition, Tab } from '@headlessui/react';
import { XMarkIcon, UserIcon, PhoneIcon, EnvelopeIcon, ChatBubbleBottomCenterTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { Lead, PhoneCall, Email, Evaluation, Comment, UserProfile } from '@/types';
import { useData } from '@/contexts/DataContext';
import mockData from '@/data/mock.json';

interface LeadDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead | null;
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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function LeadDetailsDrawer({ isOpen, onClose, lead }: LeadDetailsDrawerProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const { getPhoneCallsByLeadId, getEmailsByLeadId, getEvaluationsByLeadId, getCommentsByLeadId } = useData();

  if (!lead) return null;

  const phoneCalls = getPhoneCallsByLeadId(lead.id);
  const emails = getEmailsByLeadId(lead.id);
  const evaluations = getEvaluationsByLeadId(lead.id);
  const comments = getCommentsByLeadId(lead.id);
  const users = (mockData as any).users as UserProfile[];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const tabs = [
    { name: 'Details', icon: UserIcon, content: <DetailsTab lead={lead} /> },
    { name: `Calls (${phoneCalls.length})`, icon: PhoneIcon, content: <CallsTab calls={phoneCalls} /> },
    { name: `Emails (${emails.length})`, icon: EnvelopeIcon, content: <EmailsTab emails={emails} /> },
    { name: `Evaluations (${evaluations.length})`, icon: ChartBarIcon, content: <EvaluationsTab evaluations={evaluations} /> },
    { name: `Comments (${comments.length})`, icon: ChatBubbleBottomCenterTextIcon, content: <CommentsTab comments={comments} users={users} /> },
  ];

  function DetailsTab({ lead }: { lead: Lead }) {
    return (
      <div className="space-y-6">
        {/* Status and Priority */}
        <div className="flex space-x-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[lead.status]}`}>
            {lead.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${priorityColors[lead.priority]}`}>
            {lead.priority.toUpperCase()} PRIORITY
          </span>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <UserIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900">{lead.name}</span>
            </div>
            <div className="flex items-center space-x-3">
              <EnvelopeIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900">{lead.email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <PhoneIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-900">{lead.phone}</span>
            </div>
          </div>
        </div>

        {/* Lead Source */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Lead Source</h3>
          <p className="text-sm text-gray-600 capitalize">{lead.source.replace(/_/g, ' ')}</p>
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
        {lead.notes && (
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Notes</h3>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-200">
              <p className="text-sm text-gray-700 leading-relaxed">{lead.notes}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  function CallsTab({ calls }: { calls: PhoneCall[] }) {
    if (calls.length === 0) {
      return (
        <div className="text-center py-8">
          <PhoneIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No phone calls</h3>
          <p className="mt-1 text-sm text-gray-500">No phone call history available for this lead.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {calls.map((call) => (
          <div key={call.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center space-x-2">
                <PhoneIcon className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-gray-900">{formatDate(call.call_date)}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-gray-500">
                <span>{formatDuration(call.duration)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  call.call_outcome === 'answered' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {call.call_outcome.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md mb-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Transcript</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{call.transcript}</p>
            </div>

            {call.ai_analysis && (
              <div className="bg-blue-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">AI Analysis</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Interest Level:</span>
                    <span className="ml-1 font-medium">{call.ai_analysis.interest_level}/10</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Budget Qualified:</span>
                    <span className={`ml-1 font-medium ${call.ai_analysis.budget_qualified ? 'text-green-600' : 'text-red-600'}`}>
                      {call.ai_analysis.budget_qualified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Decision Maker:</span>
                    <span className={`ml-1 font-medium ${call.ai_analysis.decision_maker ? 'text-green-600' : 'text-red-600'}`}>
                      {call.ai_analysis.decision_maker ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Timeline:</span>
                    <span className="ml-1 font-medium">{call.ai_analysis.timeline}</span>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-gray-600">Next Steps:</span>
                  <span className="ml-1 font-medium">{call.ai_analysis.next_steps}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  function EmailsTab({ emails }: { emails: Email[] }) {
    if (emails.length === 0) {
      return (
        <div className="text-center py-8">
          <EnvelopeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No emails</h3>
          <p className="mt-1 text-sm text-gray-500">No email history available for this lead.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {emails.map((email) => (
          <div key={email.id} className={`border rounded-lg p-4 ${
            email.email_type === 'outbound' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  email.email_type === 'outbound' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                  {email.email_type.toUpperCase()}
                </span>
                <span className="text-sm font-medium text-gray-900">{email.subject}</span>
              </div>
              <span className="text-xs text-gray-500">{formatDate(email.sent_at)}</span>
            </div>
            
            <div className="bg-white p-3 rounded-md mb-2">
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{email.content}</p>
            </div>

            <div className="flex items-center space-x-4 text-xs text-gray-600">
              <span className={`px-2 py-1 rounded-full ${
                email.email_status === 'replied' ? 'bg-green-100 text-green-800' :
                email.email_status === 'opened' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {email.email_status.toUpperCase()}
              </span>
              {email.opened_at && <span>Opened: {formatDate(email.opened_at)}</span>}
              {email.clicked_at && <span>Clicked: {formatDate(email.clicked_at)}</span>}
              {email.replied_at && <span>Replied: {formatDate(email.replied_at)}</span>}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function EvaluationsTab({ evaluations }: { evaluations: Evaluation[] }) {
    if (evaluations.length === 0) {
      return (
        <div className="text-center py-8">
          <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No evaluations</h3>
          <p className="mt-1 text-sm text-gray-500">No AI evaluations available for this lead.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {evaluations.map((evaluation) => (
          <div key={evaluation.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {evaluation.evaluation_type.charAt(0).toUpperCase() + evaluation.evaluation_type.slice(1)} Evaluation
                </h3>
                <p className="text-sm text-gray-500">{formatDate(evaluation.created_at)}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">{evaluation.qualification_score}/100</div>
                <div className="text-sm text-gray-500">Qualification Score</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">BANT Criteria</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span className={evaluation.criteria_met.budget ? 'text-green-600' : 'text-red-600'}>
                      {evaluation.criteria_met.budget ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Authority:</span>
                    <span className={evaluation.criteria_met.authority ? 'text-green-600' : 'text-red-600'}>
                      {evaluation.criteria_met.authority ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Need:</span>
                    <span className={evaluation.criteria_met.need ? 'text-green-600' : 'text-red-600'}>
                      {evaluation.criteria_met.need ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Timeline:</span>
                    <span className={evaluation.criteria_met.timeline ? 'text-green-600' : 'text-red-600'}>
                      {evaluation.criteria_met.timeline ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Analysis</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Qualified:</span>
                    <span className={`ml-1 font-medium ${evaluation.evaluation_result.qualified ? 'text-green-600' : 'text-red-600'}`}>
                      {evaluation.evaluation_result.qualified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Confidence:</span>
                    <span className="ml-1 font-medium">{Math.round(evaluation.confidence_score * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Reason</h4>
                <p className="text-sm text-gray-700">{evaluation.evaluation_result.reason}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-900">Strengths</h4>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {evaluation.evaluation_result.strengths.map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Concerns</h4>
                <ul className="list-disc list-inside text-sm text-gray-700">
                  {evaluation.evaluation_result.concerns.map((concern, index) => (
                    <li key={index}>{concern}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900">Recommendation</h4>
                <p className="text-sm text-gray-700">{evaluation.evaluation_result.recommendation}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function CommentsTab({ comments, users }: { comments: Comment[], users: any[] }) {
    if (comments.length === 0) {
      return (
        <div className="text-center py-8">
          <ChatBubbleBottomCenterTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No comments</h3>
          <p className="mt-1 text-sm text-gray-500">No comments have been added for this lead.</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {comments.map((comment) => {
          const user = users.find(u => u.id === comment.user_id);
          return (
            <div key={comment.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">{user?.display_name.charAt(0) || 'U'}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{user?.display_name || 'Unknown User'}</span>
                  <span className="text-xs text-gray-500">({user?.role})</span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(comment.created_at)}</span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{comment.comment_text}</p>
              {comment.is_internal && (
                <span className="inline-block mt-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                  Internal
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto relative w-screen max-w-2xl">
                  <Transition.Child
                    as={Fragment}
                    enter="ease-in-out duration-500"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-500"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4">
                      <button
                        type="button"
                        className="rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                        onClick={onClose}
                      >
                        <span className="sr-only">Close panel</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    </div>
                  </Transition.Child>

                  <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{lead.name}</div>
                            <div className="text-sm text-gray-500">{lead.email}</div>
                          </div>
                        </div>
                      </Dialog.Title>
                    </div>

                    <div className="mt-6 flex-1 px-4 sm:px-6">
                      <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
                        <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
                          {tabs.map((tab, index) => (
                            <Tab
                              key={tab.name}
                              className={({ selected }) =>
                                classNames(
                                  'w-full rounded-lg py-2.5 px-3 text-sm font-medium leading-5',
                                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                                  selected
                                    ? 'bg-white text-blue-700 shadow'
                                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-gray-900'
                                )
                              }
                            >
                              <div className="flex items-center justify-center space-x-2">
                                <tab.icon className="w-4 h-4" />
                                <span className="hidden sm:block">{tab.name}</span>
                              </div>
                            </Tab>
                          ))}
                        </Tab.List>
                        <Tab.Panels className="mt-6">
                          {tabs.map((tab, index) => (
                            <Tab.Panel
                              key={index}
                              className={classNames(
                                'rounded-xl bg-white',
                                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
                              )}
                            >
                              {tab.content}
                            </Tab.Panel>
                          ))}
                        </Tab.Panels>
                      </Tab.Group>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}