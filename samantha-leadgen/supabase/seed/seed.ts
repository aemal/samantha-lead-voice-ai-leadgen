import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Load mock data
const mockDataPath = resolve(__dirname, '../../src/data/mock.json');
const mockData = JSON.parse(readFileSync(mockDataPath, 'utf8'));

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await supabase.from('lead_comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_evaluations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_emails').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_phone_calls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Seed leads
    console.log('👥 Seeding leads...');
    const leadsToInsert = mockData.leads.map((lead: any) => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      status: lead.status,
      source: lead.source,
      created_at: lead.created_at,
      updated_at: lead.updated_at,
      notes: lead.notes,
      priority: lead.priority
    }));

    const { error: leadsError } = await supabase
      .from('leads')
      .insert(leadsToInsert);

    if (leadsError) {
      throw new Error(`Error seeding leads: ${leadsError.message}`);
    }

    console.log(`✅ Inserted ${leadsToInsert.length} leads`);

    // Seed phone calls
    console.log('📞 Seeding phone calls...');
    const callsToInsert = mockData.phone_calls.map((call: any) => ({
      id: call.id,
      lead_id: call.lead_id,
      call_date: call.call_date,
      duration: call.duration,
      transcript: call.transcript,
      call_outcome: call.call_outcome,
      ai_analysis: call.ai_analysis,
      created_at: call.created_at
    }));

    const { error: callsError } = await supabase
      .from('lead_phone_calls')
      .insert(callsToInsert);

    if (callsError) {
      throw new Error(`Error seeding phone calls: ${callsError.message}`);
    }

    console.log(`✅ Inserted ${callsToInsert.length} phone calls`);

    // Seed emails
    console.log('📧 Seeding emails...');
    const emailsToInsert = mockData.emails.map((email: any) => ({
      id: email.id,
      lead_id: email.lead_id,
      email_type: email.email_type,
      subject: email.subject,
      content: email.content,
      sent_at: email.sent_at,
      opened_at: email.opened_at,
      clicked_at: email.clicked_at,
      replied_at: email.replied_at,
      email_status: email.email_status,
      created_at: email.sent_at
    }));

    const { error: emailsError } = await supabase
      .from('lead_emails')
      .insert(emailsToInsert);

    if (emailsError) {
      throw new Error(`Error seeding emails: ${emailsError.message}`);
    }

    console.log(`✅ Inserted ${emailsToInsert.length} emails`);

    // Seed evaluations
    console.log('📊 Seeding evaluations...');
    const evaluationsToInsert = mockData.evaluations.map((evaluation: any) => ({
      id: evaluation.id,
      lead_id: evaluation.lead_id,
      evaluation_type: evaluation.evaluation_type,
      qualification_score: evaluation.qualification_score,
      evaluation_result: evaluation.evaluation_result,
      criteria_met: evaluation.criteria_met,
      confidence_score: evaluation.confidence_score,
      created_at: evaluation.created_at,
      evaluator_version: evaluation.evaluator_version
    }));

    const { error: evaluationsError } = await supabase
      .from('lead_evaluations')
      .insert(evaluationsToInsert);

    if (evaluationsError) {
      throw new Error(`Error seeding evaluations: ${evaluationsError.message}`);
    }

    console.log(`✅ Inserted ${evaluationsToInsert.length} evaluations`);

    // Create a default auth user and profile for demo purposes
    console.log('👤 Creating demo user profile...');
    
    // Note: In a real implementation, you would create auth users through Supabase Auth
    // For this demo, we'll create user profiles directly
    const userProfilesToInsert = mockData.users.map((user: any) => ({
      id: user.id,
      display_name: user.display_name,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      last_active: user.last_active
    }));

    const { error: userError } = await supabase
      .from('user_profiles')
      .insert(userProfilesToInsert);

    if (userError) {
      console.log('⚠️  User profiles seeding skipped (requires auth users to exist first)');
    } else {
      console.log(`✅ Inserted ${userProfilesToInsert.length} user profiles`);
    }

    // Seed comments (skip user_id validation for demo)
    console.log('💬 Seeding comments...');
    const commentsToInsert = mockData.comments.map((comment: any) => ({
      id: comment.id,
      lead_id: comment.lead_id,
      user_id: comment.user_id,
      comment_text: comment.comment_text,
      is_internal: comment.is_internal,
      created_at: comment.created_at,
      updated_at: comment.updated_at
    }));

    const { error: commentsError } = await supabase
      .from('lead_comments')
      .insert(commentsToInsert);

    if (commentsError) {
      console.log('⚠️  Comments seeding skipped (requires auth users to exist first)');
    } else {
      console.log(`✅ Inserted ${commentsToInsert.length} comments`);
    }

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed script
seedDatabase();