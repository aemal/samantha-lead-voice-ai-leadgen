import { Comment, UserProfile } from '@/types';
import mockDataJson from '@/data/mock.json';

// Mock API service for comments
export class CommentService {
  private static comments: Comment[] = [];
  private static users: UserProfile[] = mockDataJson.users as UserProfile[];

  static {
    // Initialize with converted mock data
    this.comments = mockDataJson.comments.map((comment: any) => ({
      id: comment.id,
      lead_id: comment.lead_id,
      user_id: comment.user_id,
      content: comment.comment_text,
      is_internal: comment.is_internal,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      parent_id: comment.parent_comment_id,
      is_edited: false
    }));
  }

  // Get all comments for a lead
  static async getCommentsByLeadId(leadId: string): Promise<Comment[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return this.comments
      .filter(comment => comment.lead_id === leadId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  // Create a new comment
  static async createComment(data: {
    lead_id: string;
    user_id: string;
    content: string;
    is_internal?: boolean;
    parent_id?: string;
  }): Promise<Comment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const newComment: Comment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      lead_id: data.lead_id,
      user_id: data.user_id,
      content: data.content,
      is_internal: data.is_internal ?? true,
      parent_id: data.parent_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_edited: false
    };

    this.comments.push(newComment);
    return newComment;
  }

  // Update a comment
  static async updateComment(commentId: string, data: {
    content?: string;
    is_internal?: boolean;
  }): Promise<Comment> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 200));

    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const updatedComment = {
      ...this.comments[commentIndex],
      ...data,
      updated_at: new Date().toISOString(),
      is_edited: true
    };

    this.comments[commentIndex] = updatedComment;
    return updatedComment;
  }

  // Delete a comment
  static async deleteComment(commentId: string): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 150));

    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    // For threading, we need to handle child comments
    const comment = this.comments[commentIndex];
    const childComments = this.comments.filter(c => c.parent_id === comment.id);

    if (childComments.length > 0) {
      // If comment has replies, replace with deleted placeholder
      this.comments[commentIndex] = {
        ...comment,
        content: '[This comment has been deleted]',
        is_edited: true,
        updated_at: new Date().toISOString()
      };
    } else {
      // If no replies, actually remove the comment
      this.comments.splice(commentIndex, 1);
    }
  }

  // Get user by ID for avatar and display name
  static getUserById(userId: string): UserProfile | undefined {
    return this.users.find(user => user.id === userId);
  }

  // Get threaded comments (organized by parent-child relationship)
  static async getThreadedComments(leadId: string): Promise<Comment[]> {
    const allComments = await this.getCommentsByLeadId(leadId);
    
    // Separate parent comments and replies
    const parentComments = allComments.filter(comment => !comment.parent_id);
    const replyComments = allComments.filter(comment => comment.parent_id);
    
    // Build threaded structure
    const threaded: Comment[] = [];
    
    parentComments.forEach(parent => {
      threaded.push(parent);
      
      // Add replies after parent
      const replies = replyComments
        .filter(reply => reply.parent_id === parent.id)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      
      threaded.push(...replies);
    });
    
    return threaded;
  }
}