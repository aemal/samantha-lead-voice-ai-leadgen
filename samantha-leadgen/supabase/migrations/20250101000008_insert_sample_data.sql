-- First ensure we have sample leads to reference
-- Insert sample leads if they don't exist
INSERT INTO leads (id, name, email, phone, status, source, notes, priority)
VALUES 
  ('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'Sarah Chen', 'sarah.chen@techcorp.com', '+1-555-0123', 'qualified', 'Website Form', 'VP of Sales at TechCorp - 50 person sales team, $100k budget approved', 'high'),
  ('4f8c4f5b-2d4e-5f6g-789a-bcd234eff567', 'Mike Johnson', 'mike.johnson@startup.com', '+1-555-0124', 'lead', 'Cold Outreach', 'Growing startup, recently implemented new system', 'low'),
  ('5g9d5g6c-3e5f-6g7h-89ab-cde345fgg678', 'Jennifer Davis', 'jennifer.davis@company.com', '+1-555-0125', 'disqualified', 'Referral', 'Wrong contact person - not decision maker', 'low')
ON CONFLICT (id) DO NOTHING;

-- Ensure we have sample user profiles
INSERT INTO user_profiles (id, display_name, role, avatar_url)
VALUES 
  ('user-001', 'John Doe', 'manager', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face'),
  ('user-002', 'Sarah Wilson', 'sales_rep', 'https://images.unsplash.com/photo-1494790108755-2616b612b1c2?w=32&h=32&fit=crop&crop=face'),
  ('user-003', 'Mike Johnson', 'sales_rep', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face')
ON CONFLICT (id) DO NOTHING;

-- Insert sample phone calls data
INSERT INTO lead_phone_calls (lead_id, call_date, duration, transcript, call_outcome, ai_analysis) VALUES
-- Phone calls for lead-001 (Sarah Chen)
('3e7b3e4a-1c3d-4e5f-6789-abc123def456', '2024-01-15T10:30:00Z', 1245, 
'Agent: Hi Sarah, this is John from TechSolutions. Thank you for showing interest in our CRM platform. How are you today?

Sarah: Hi John, I''m doing well, thank you. Yes, I submitted an inquiry because we''re really struggling with our current system. It''s outdated and doesn''t integrate well with our other tools.

Agent: I understand that frustration. Can you tell me more about your current setup and what specific challenges you''re facing?

Sarah: We''re using an old system that doesn''t sync with our email marketing tools or our accounting software. We have about 50 sales reps who are constantly complaining about data entry and missing information. We''re losing potential deals because of poor follow-up.

Agent: That sounds like exactly what our platform was designed to solve. We specialize in integrations and automated workflows. What''s your timeline for making a decision on a new system?

Sarah: We need to have something in place by Q2. Our board has approved a budget of up to $100,000 annually for the right solution. I have full authority to make this decision.

Agent: That''s perfect. Our enterprise plan would fit well within that budget and include all the integrations you mentioned. Would you be available for a product demo next week?

Sarah: Absolutely. Tuesday or Wednesday afternoon would work best for me.

Agent: Great! I''ll schedule that and send you a calendar invite. I''ll also include our integration specialist in the meeting.

Sarah: Perfect. I''m looking forward to seeing what you can offer.',
'answered', 
'{"interest_level": 9, "budget_qualified": true, "decision_maker": true, "timeline": "Q2 2024", "pain_points": ["Outdated system", "Poor integrations", "Data entry issues", "Missed follow-ups"], "next_steps": "Schedule product demo for next week"}'::jsonb),

('3e7b3e4a-1c3d-4e5f-6789-abc123def456', '2024-01-18T14:15:00Z', 2156,
'Agent: Hi Sarah, John here from TechSolutions. I hope the demo went well for you earlier this week. I wanted to follow up and see if you have any questions.

Sarah: Hi John! Yes, the demo was fantastic. The integration capabilities are exactly what we need. I''ve been discussing it with my team, and everyone is excited about the automation features.

Agent: That''s wonderful to hear! What are your next steps internally?

Sarah: I need to present this to our executive team next Monday. After that, assuming they approve - which I''m confident they will - we''d like to move forward with implementation.

Agent: Excellent! I can prepare a formal proposal with pricing and implementation timeline. When would you like to start?

Sarah: Ideally by March 1st. We want to have everyone trained before our busy Q2 season starts.

Agent: That''s definitely achievable. I''ll have the proposal to you by tomorrow, and we can discuss the implementation plan.',
'answered',
'{"interest_level": 10, "budget_qualified": true, "decision_maker": true, "timeline": "March 1st start", "pain_points": ["Team buy-in needed", "Executive approval required"], "next_steps": "Send formal proposal by tomorrow"}'::jsonb),

-- Phone calls for lead-002 (Mike Johnson)
('4f8c4f5b-2d4e-5f6g-789a-bcd234eff567', '2024-01-16T09:45:00Z', 892,
'Agent: Hello Mike, this is Lisa from TechSolutions. I''m calling about your inquiry regarding our CRM system.

Mike: Oh right, yes. Look, I''m quite busy right now. Can you just send me some information?

Agent: Of course, I understand you''re busy. Just a quick question - what''s prompting you to look at new CRM solutions?

Mike: Our current system is okay, but we''re growing and might need something more robust eventually.

Agent: I see. What size is your team currently?

Mike: We have about 15 sales people. But honestly, I''m not sure if now is the right time to switch. We just implemented our current system last year.

Agent: That makes sense. Would it help if I sent you some information about our migration services and how we help companies transition smoothly?

Mike: Sure, that would be fine. But I should mention, any decision would need to go through our board, and they''re pretty cost-conscious right now.

Agent: Understood. I''ll send you our information packet and perhaps we can reconnect in a few months when the timing is better.',
'answered',
'{"interest_level": 4, "budget_qualified": false, "decision_maker": false, "timeline": "6+ months", "pain_points": ["Recent implementation", "Cost concerns", "Board approval needed"], "next_steps": "Send information packet, follow up in 3-6 months"}'::jsonb),

-- Phone calls for lead-003 (Jennifer Davis)  
('5g9d5g6c-3e5f-6g7h-89ab-cde345fgg678', '2024-01-17T11:20:00Z', 456,
'Agent: Hi Jennifer, this is Mark from TechSolutions calling about your CRM inquiry.

Jennifer: I''m sorry, who is this from?

Agent: TechSolutions - you submitted an inquiry on our website about CRM software.

Jennifer: Oh, I don''t remember doing that. I think someone else on my team might have done that. I''m not really involved in those kinds of decisions.

Agent: I see. Who would be the right person to speak with about CRM needs?

Jennifer: That would be our IT director, but he''s out this week. You might want to try calling back next week.

Agent: Thank you for letting me know. I''ll make a note to follow up next week.',
'answered',
'{"interest_level": 1, "budget_qualified": false, "decision_maker": false, "timeline": "Unknown", "pain_points": ["Wrong contact person", "Not decision maker"], "next_steps": "Contact IT director next week"}'::jsonb);

-- Insert sample emails data
INSERT INTO lead_emails (lead_id, email_type, subject, content, sent_at, opened_at, clicked_at, email_status) VALUES
-- Emails for lead-001 (Sarah Chen)
('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'outbound', 'Thank you for your CRM inquiry - Let''s schedule a demo', 
'Hi Sarah,

Thank you for reaching out about our CRM platform. I''m excited to help you solve the integration and workflow challenges you mentioned.

Based on your inquiry, it sounds like you''re dealing with:
- Disconnected systems that don''t talk to each other
- Manual data entry causing inefficiencies
- Missed follow-up opportunities

Our platform was specifically designed to address these exact pain points. We''ve helped over 500 companies streamline their sales processes and increase productivity by up to 40%.

I''d love to show you how our system could work for your team. Are you available for a brief 30-minute demo this week? I can show you:

1. Real-time integrations with popular tools
2. Automated workflow examples
3. Custom reporting dashboards
4. Migration process overview

Let me know what times work best for you.

Best regards,
John Smith
Senior Sales Representative
TechSolutions CRM', 
'2024-01-14T09:30:00Z', '2024-01-14T10:15:00Z', '2024-01-14T10:18:00Z', 'clicked'),

('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'inbound', 'Re: Thank you for your CRM inquiry - Let''s schedule a demo',
'Hi John,

Thanks for your email. I''m definitely interested in seeing a demo. The challenges you listed are exactly what we''re facing.

I''m available Tuesday afternoon after 2 PM or Wednesday morning before 11 AM. 

Could you also send me some information about pricing? We have a budget approved, but I''d like to see the different plan options.

Thanks,
Sarah Chen
VP of Sales
TechCorp Solutions',
'2024-01-14T11:45:00Z', null, null, 'replied'),

('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'outbound', 'Demo scheduled + Pricing information enclosed',
'Hi Sarah,

Perfect! I''ve scheduled our demo for Tuesday, January 16th at 2:00 PM. You should receive a calendar invite shortly.

As requested, I''ve attached our pricing guide. Based on what you''ve shared about your team size (50 reps), I believe our Professional Plan at $89/user/month would be the best fit. This includes:

- Unlimited integrations
- Advanced automation workflows  
- Custom reporting
- Priority support
- Full migration assistance

For 50 users, this would be $4,450/month or $53,400/year - well within your approved budget.

I''ll also include our integration specialist, Maria, in the demo so she can address any technical questions about connecting with your existing tools.

Looking forward to our call!

Best,
John',
'2024-01-14T14:20:00Z', '2024-01-14T15:05:00Z', '2024-01-14T15:08:00Z', 'clicked'),

-- Emails for lead-002 (Mike Johnson)
('4f8c4f5b-2d4e-5f6g-789a-bcd234eff567', 'outbound', 'Following up on your CRM inquiry',
'Hi Mike,

I hope this email finds you well. I wanted to follow up on the CRM inquiry you submitted last week.

Many growing companies find themselves in a similar position - their current system worked great when they were smaller, but as they scale, they start hitting limitations.

I''d love to learn more about your current setup and challenges. Even if you''re not ready to make a change right now, I can share some best practices that might help optimize your current system.

Would you be open to a brief 15-minute conversation this week?

Best regards,
Lisa Thompson
Account Executive
TechSolutions',
'2024-01-15T08:45:00Z', '2024-01-15T16:30:00Z', null, 'opened'),

-- Emails for lead-003 (Jennifer Davis)
('5g9d5g6c-3e5f-6g7h-89ab-cde345fgg678', 'outbound', 'CRM Solutions for Your Team',
'Hi Jennifer,

Thank you for your interest in TechSolutions CRM. I understand from our brief conversation that your IT director is the decision maker for these types of solutions.

I''d be happy to connect with them when they return. In the meantime, I''ve attached some materials that might be helpful:

- ROI Calculator
- Feature comparison sheet
- Customer case studies

Please feel free to share these with your IT director, and I''ll plan to follow up next week.

Best regards,
Mark Wilson
TechSolutions',
'2024-01-17T16:00:00Z', null, null, 'sent');

-- Insert sample evaluations data
INSERT INTO lead_evaluations (lead_id, evaluation_type, qualification_score, evaluation_result, criteria_met, confidence_score, evaluator_version) VALUES
-- Evaluation for lead-001 (Sarah Chen)
('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'phone', 95,
'{"qualified": true, "reason": "Highly qualified prospect with clear authority, approved budget, and urgent timeline. Strong pain points align perfectly with our solution.", "strengths": ["Decision maker with full authority", "Pre-approved budget of $100k annually", "Clear timeline (Q2 implementation)", "Well-defined pain points", "Engaged and responsive"], "concerns": ["Executive team approval still needed", "Competitive evaluation possible"], "recommendation": "High priority - fast-track through sales process"}'::jsonb,
'{"budget": true, "authority": true, "need": true, "timeline": true}'::jsonb,
0.94, 'v2.1.3'),

('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'email', 88,
'{"qualified": true, "reason": "Email responses show strong engagement and clear buying signals. Quick response times and specific questions indicate serious interest.", "strengths": ["Quick email responses", "Specific pricing questions", "Readily available for demo", "Professional communication"], "concerns": ["Limited technical details discussed", "No urgency indicators in email"], "recommendation": "Continue with demo as planned"}'::jsonb,
'{"budget": true, "authority": true, "need": true, "timeline": false}'::jsonb,
0.85, 'v2.1.3'),

-- Evaluation for lead-002 (Mike Johnson)
('4f8c4f5b-2d4e-5f6g-789a-bcd234eff567', 'phone', 35,
'{"qualified": false, "reason": "Low qualification score due to recent system implementation, unclear budget authority, and extended timeline. Not currently a sales priority.", "strengths": ["Answered the call", "Growing company", "Acknowledged potential future need"], "concerns": ["Just implemented new system", "No clear budget", "Board approval required", "Extended timeline", "Low engagement level"], "recommendation": "Place in nurture campaign - follow up in 6 months"}'::jsonb,
'{"budget": false, "authority": false, "need": false, "timeline": false}'::jsonb,
0.72, 'v2.1.3'),

-- Evaluation for lead-003 (Jennifer Davis)
('5g9d5g6c-3e5f-6g7h-89ab-cde345fgg678', 'phone', 15,
'{"qualified": false, "reason": "Very low qualification - wrong contact person, no decision-making authority, and unclear need. Should focus on finding correct stakeholder.", "strengths": ["Honest about not being decision maker", "Provided redirect information"], "concerns": ["Not the decision maker", "No memory of inquiry", "No established need", "No timeline", "No budget discussion"], "recommendation": "Research and contact IT director directly"}'::jsonb,
'{"budget": false, "authority": false, "need": false, "timeline": false}'::jsonb,
0.68, 'v2.1.3');

-- Insert sample comments data  
INSERT INTO lead_comments (lead_id, user_id, comment_text, is_internal, parent_comment_id) VALUES
-- Comments for lead-001 (Sarah Chen)
('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'user-001', 
'Excellent prospect! Sarah has clear authority and approved budget of $100k annually. Fast-track this one through the demo process. Make sure to include IT Director in the technical demo.', 
true, null),

('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'user-002',
'Demo went fantastic - she was very engaged and asked great technical questions. Her team is excited about the automation features. She mentioned they need to start by March 1st.',
true, null),

('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'user-003',
'Preparing proposal now. Including custom migration timeline and training schedule. This should close within 2 weeks if executive approval goes smoothly.',
true, null),

('3e7b3e4a-1c3d-4e5f-6789-abc123def456', 'user-001',
'Update: Proposal sent yesterday. Sarah confirmed executive meeting is scheduled for Monday. She''s confident about approval. Preparing implementation team for March 1st start.',
false, null),

-- Comments for lead-002 (Mike Johnson)  
('4f8c4f5b-2d4e-5f6g-789a-bcd234eff567', 'user-002',
'Low priority lead. They just implemented a new system last year and don''t have budget approval. Recommend nurture campaign with quarterly check-ins.',
true, null),

('4f8c4f5b-2d4e-5f6g-789a-bcd234eff567', 'user-003',
'Agreed. Added to 6-month follow-up sequence. Will send educational content about CRM best practices to stay top of mind.',
true, null),

-- Comments for lead-003 (Jennifer Davis)
('5g9d5g6c-3e5f-6g7h-89ab-cde345fgg678', 'user-001',
'Wrong contact - Jennifer is not the decision maker. Need to reach IT Director directly. Researching contact info for proper stakeholder.',
true, null),

('5g9d5g6c-3e5f-6g7h-89ab-cde345fgg678', 'user-002',
'Found IT Director info: Robert Chen, rchen@techcorp.com. Planning to reach out directly next week with technical focus rather than sales approach.',
true, null);