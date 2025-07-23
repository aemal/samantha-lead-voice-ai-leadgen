import { z } from 'zod';

export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  status: z.enum(['lead', 'qualified', 'disqualified', 'appointment_booked']).default('lead'),
  source: z.string().optional(),
  notes: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

export const updateLeadSchema = leadSchema.partial();

export const phoneCallSchema = z.object({
  lead_id: z.string().uuid('Valid lead ID is required'),
  call_date: z.string().datetime('Valid call date is required'),
  duration: z.number().int().min(0).optional(),
  transcript: z.string().optional(),
  call_outcome: z.enum(['answered', 'voicemail', 'no_answer', 'busy']).optional(),
  ai_analysis: z.any().optional()
});

export const emailSchema = z.object({
  lead_id: z.string().uuid('Valid lead ID is required'),
  email_type: z.enum(['outbound', 'inbound']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Email content is required'),
  sent_at: z.string().datetime().optional(),
  opened_at: z.string().datetime().optional(),
  clicked_at: z.string().datetime().optional(),
  replied_at: z.string().datetime().optional(),
  email_status: z.enum(['sent', 'delivered', 'opened', 'clicked', 'replied']).default('sent')
});

export const evaluationSchema = z.object({
  lead_id: z.string().uuid('Valid lead ID is required'),
  evaluation_type: z.enum(['phone', 'email']),
  qualification_score: z.number().int().min(1).max(100),
  evaluation_result: z.any(),
  criteria_met: z.any(),
  confidence_score: z.number().min(0).max(9.99),
  evaluator_version: z.string().min(1, 'Evaluator version is required')
});

export const commentSchema = z.object({
  lead_id: z.string().uuid('Valid lead ID is required'),
  comment_text: z.string().min(1, 'Comment text is required'),
  is_internal: z.boolean().default(false),
  parent_comment_id: z.string().uuid().optional()
});

export const updateCommentSchema = z.object({
  comment_text: z.string().min(1, 'Comment text is required'),
  is_internal: z.boolean().optional()
});