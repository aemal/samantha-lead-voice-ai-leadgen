'use client';

import React, { useState, useCallback } from 'react';
import CommentEditor from './CommentEditor';
import { CommentService } from '@/services/commentService';
import { Comment } from '@/types';

interface CommentFormProps {
  leadId: string;
  userId: string; // Current user ID
  parentId?: string; // For replies
  onCommentCreated: (comment: Comment) => void;
  onCancel?: () => void;
  placeholder?: string;
  className?: string;
  isReply?: boolean;
  // Edit mode props
  isEditing?: boolean;
  initialContent?: string;
  commentId?: string;
  onCommentUpdated?: (comment: Comment) => void;
}

export default function CommentForm({
  leadId,
  userId,
  parentId,
  onCommentCreated,
  onCancel,
  placeholder,
  className = "",
  isReply = false,
  isEditing = false,
  initialContent = '',
  commentId,
  onCommentUpdated
}: CommentFormProps) {
  const [content, setContent] = useState(initialContent);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      if (isEditing && commentId && onCommentUpdated) {
        // Edit existing comment
        const updatedComment = await CommentService.updateComment(commentId, { content });
        onCommentUpdated(updatedComment);
        
        // Clear the form and close edit mode
        setContent('');
        if (onCancel) onCancel();
        
      } else {
        // Create new comment - no optimistic updates to avoid duplication
        // Clear the form first
        setContent('');
        if (onCancel) onCancel();

        // Make the actual API call
        const newComment = await CommentService.createComment({
          lead_id: leadId,
          user_id: userId,
          content,
          is_internal: true,
          parent_id: parentId
        });

        // Add the real comment to the UI
        onCommentCreated(newComment);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${isEditing ? 'update' : 'create'} comment`);
      // Don't clear form on error so user doesn't lose their work
      if (!isEditing) {
        setContent(content); // Restore content for new comments
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [content, isSubmitting, isEditing, commentId, leadId, userId, parentId, onCommentCreated, onCommentUpdated, onCancel]);

  const handleCancel = useCallback(() => {
    setContent('');
    setError(null);
    if (onCancel) onCancel();
  }, [onCancel]);

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent);
    if (error) setError(null);
  }, [error]);


  return (
    <div className={`space-y-2 ${className}`}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
          {error}
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      <CommentEditor
        value={content}
        onChange={handleContentChange}
        placeholder={placeholder || (isReply ? "Write a reply..." : "Add a comment...")}
        onSubmit={handleSubmit}
        onCancel={onCancel ? handleCancel : undefined}
        submitButtonText={isEditing ? "Update" : (isReply ? "Reply" : "Comment")}
        showCancelButton={!!onCancel}
        disabled={isSubmitting}
        className="min-h-[120px]"
      />

      {isSubmitting && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          <span>Posting {isReply ? 'reply' : 'comment'}...</span>
        </div>
      )}
    </div>
  );
}

// Validation helper
export function validateComment(content: string): string | null {
  const textContent = content.replace(/<[^>]*>/g, '').trim();
  
  if (!textContent) {
    return 'Comment cannot be empty';
  }
  
  if (textContent.length > 5000) {
    return 'Comment is too long (maximum 5000 characters)';
  }
  
  return null;
}