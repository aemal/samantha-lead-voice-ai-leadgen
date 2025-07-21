'use client';

import React, { useState, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Comment, UserProfile } from '@/types';
import CommentForm from './CommentForm';
import ConfirmDialog from './ConfirmDialog';

interface CommentItemProps {
  comment: Comment;
  user?: UserProfile;
  currentUserId: string;
  leadId: string;
  depth: number;
  onReply?: (comment: Comment) => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  className?: string;
}

export default function CommentItem({
  comment,
  user,
  currentUserId,
  leadId,
  depth,
  onReply,
  onEdit,
  onDelete,
  className = ""
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isOwnComment = comment.user_id === currentUserId;
  const isDeleted = comment.content === '[This comment has been deleted]';
  const maxDepth = 3; // Limit nesting depth

  const handleReplyCreated = useCallback((newComment: Comment) => {
    if (onReply) {
      onReply(newComment);
    }
    setIsReplying(false);
  }, [onReply]);


  const handleDelete = useCallback(() => {
    setShowDeleteDialog(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (onDelete) {
      onDelete(comment.id);
    }
    setShowDeleteDialog(false);
  }, [comment.id, onDelete]);

  const cancelDelete = useCallback(() => {
    setShowDeleteDialog(false);
  }, []);

  // Calculate indentation based on depth
  const indentClass = depth > 0 ? `ml-${Math.min(depth * 8, 24)}` : '';

  return (
    <div className={`${indentClass} ${className}`}>
      <div
        className={`group relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow ${
          depth > 0 ? 'border-l-4 border-l-blue-200' : ''
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            {/* User Avatar */}
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
              {user?.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.display_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-medium text-gray-600">
                  {user?.display_name?.charAt(0) || '?'}
                </span>
              )}
            </div>

            {/* User Info */}
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {user?.display_name || 'Unknown User'}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <time dateTime={comment.created_at}>
                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </time>
                {comment.is_edited && (
                  <>
                    <span>•</span>
                    <span className="italic">edited</span>
                  </>
                )}
                {user?.role && (
                  <>
                    <span>•</span>
                    <span className="capitalize">{user.role.replace('_', ' ')}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Action Menu */}
          {showActions && !isDeleted && (
            <div className="flex items-center gap-1 opacity-100 transition-opacity">
              {depth < maxDepth && onReply && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Reply to comment"
                >
                  Reply
                </button>
              )}
              
              {isOwnComment && onEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-2 py-1 text-xs text-gray-500 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Edit comment"
                >
                  Edit
                </button>
              )}
              
              {isOwnComment && onDelete && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete comment"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comment Content */}
        {isEditing && !isDeleted ? (
          <div className="mt-2">
            <CommentForm
              leadId={leadId}
              userId={currentUserId}
              isEditing={true}
              commentId={comment.id}
              initialContent={comment.content}
              onCommentCreated={() => {}} // Not used in edit mode
              onCommentUpdated={(updatedComment) => {
                if (onEdit) {
                  onEdit(comment.id, updatedComment.content);
                }
                setIsEditing(false);
              }}
              onCancel={() => setIsEditing(false)}
              placeholder="Edit your comment..."
              className="mt-2"
            />
          </div>
        ) : (
          <div className={`prose prose-sm max-w-none ${isDeleted ? 'italic text-gray-500' : ''}`}>
            <div dangerouslySetInnerHTML={{ __html: comment.content }} />
          </div>
        )}

        {/* Internal Comment Badge */}
        {comment.is_internal && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
              Internal Note
            </span>
          </div>
        )}

        {/* Reply Form */}
        {isReplying && onReply && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414L2.586 8l3.707-3.707a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-2">
                  Replying to <span className="font-medium">{user?.display_name}</span>
                </p>
                <CommentForm
                  leadId={leadId}
                  userId={currentUserId}
                  parentId={comment.id}
                  onCommentCreated={handleReplyCreated}
                  onCancel={() => setIsReplying(false)}
                  placeholder="Write a reply..."
                  isReply={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <ConfirmDialog
          isOpen={showDeleteDialog}
          title="Delete Comment"
          message={
            comment.parent_id 
              ? "Are you sure you want to delete this reply? This action cannot be undone."
              : "Are you sure you want to delete this comment? This action cannot be undone and may affect replies to this comment."
          }
          confirmText="Delete"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          isDestructive={true}
        />
      </div>
    </div>
  );
}