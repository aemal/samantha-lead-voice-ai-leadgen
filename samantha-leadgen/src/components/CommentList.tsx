'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Comment, UserProfile } from '@/types';
import { CommentService } from '@/services/commentService';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { useData } from '@/contexts/DataContext';

interface CommentListProps {
  leadId: string;
  currentUserId: string;
  className?: string;
}

export default function CommentList({
  leadId,
  currentUserId,
  className = ""
}: CommentListProps) {
  const { getCommentsByLeadId, addComment, updateComment, deleteComment } = useData();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewCommentForm, setShowNewCommentForm] = useState(false);

  // Get comments from context
  const comments = getCommentsByLeadId(leadId);

  // Get users data - memoized to avoid recalculation
  const users = useMemo(() => {
    const uniqueUserIds = [...new Set(comments.map(c => c.user_id))];
    const usersData: { [key: string]: UserProfile } = {};
    
    uniqueUserIds.forEach(userId => {
      const user = CommentService.getUserById(userId);
      if (user) {
        usersData[userId] = user;
      }
    });
    
    return usersData;
  }, [comments]);

  // Handle new comment creation
  const handleCommentCreated = useCallback(async (newComment: Comment) => {
    // Add to data context
    addComment(newComment);
    setShowNewCommentForm(false);
  }, [addComment]);

  // Handle comment editing
  const handleCommentEdit = useCallback(async (commentId: string, content: string) => {
    try {
      const updatedComment = await CommentService.updateComment(commentId, { content });
      updateComment(commentId, updatedComment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update comment');
    }
  }, [updateComment]);

  // Handle comment deletion
  const handleCommentDelete = useCallback(async (commentId: string) => {
    try {
      await CommentService.deleteComment(commentId);
      deleteComment(commentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete comment');
    }
  }, [deleteComment]);

  // Build threaded comment structure
  const threadedComments = useMemo(() => {
    const rootComments: Comment[] = [];
    const childComments = new Map<string, Comment[]>();

    // Separate root comments and organize children
    comments.forEach(comment => {
      if (!comment.parent_id) {
        rootComments.push(comment);
      } else {
        if (!childComments.has(comment.parent_id)) {
          childComments.set(comment.parent_id, []);
        }
        childComments.get(comment.parent_id)!.push(comment);
      }
    });

    // Sort root comments by creation date (newest first)
    rootComments.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    // Sort child comments by creation date (oldest first)
    childComments.forEach(children => {
      children.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    });

    return { rootComments, childComments };
  }, [comments]);

  // Recursive function to render comment threads
  const renderComment = useCallback((comment: Comment, depth: number = 0): React.ReactElement => {
    const user = users[comment.user_id];
    const children = threadedComments.childComments.get(comment.id) || [];
    const hasReplies = children.length > 0;

    return (
      <div key={comment.id} className="space-y-3">
        <CommentItem
          comment={comment}
          user={user}
          currentUserId={currentUserId}
          leadId={leadId}
          depth={depth}
          onReply={handleCommentCreated}
          onEdit={handleCommentEdit}
          onDelete={handleCommentDelete}
        />
        
        {/* Render child comments with threading lines */}
        {hasReplies && (
          <div className="relative">
            {/* Threading line */}
            {depth < 2 && (
              <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200"></div>
            )}
            <div className={`space-y-3 ${depth < 2 ? 'ml-8' : 'ml-4'}`}>
              {children.map((child) => (
                <div key={child.id} className="relative">
                  {/* Connection line to parent */}
                  {depth < 2 && (
                    <div className="absolute -left-8 top-4 w-8 h-px bg-gray-200"></div>
                  )}
                  {renderComment(child, depth + 1)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }, [users, threadedComments.childComments, currentUserId, leadId, handleCommentCreated, handleCommentEdit, handleCommentDelete]);

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Comments</h3>
          <div className="animate-pulse w-6 h-6 bg-gray-200 rounded"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Comments ({comments.length})
        </h3>
        <button
          onClick={() => setShowNewCommentForm(!showNewCommentForm)}
          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
        >
          {showNewCommentForm ? 'Cancel' : 'Add Comment'}
        </button>
      </div>

      {/* New Comment Form */}
      {showNewCommentForm && (
        <div className="bg-gray-50 rounded-lg p-4">
          <CommentForm
            leadId={leadId}
            userId={currentUserId}
            onCommentCreated={handleCommentCreated}
            onCancel={() => setShowNewCommentForm(false)}
            placeholder="Share your thoughts or add internal notes..."
          />
        </div>
      )}

      {/* Comments List */}
      {threadedComments.rootComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-lg">No comments yet</p>
          <p className="text-sm">Be the first to add a comment or internal note</p>
        </div>
      ) : (
        <div className="space-y-4">
          {threadedComments.rootComments.map(comment => renderComment(comment, 0))}
        </div>
      )}
    </div>
  );
}