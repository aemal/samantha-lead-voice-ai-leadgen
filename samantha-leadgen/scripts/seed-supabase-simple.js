require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const mockData = require('../src/data/mock.json');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// You need to set this to your actual Supabase user ID
// You can find this in Supabase Dashboard > Authentication > Users
const YOUR_USER_ID = 'YOUR_SUPABASE_USER_ID_HERE';

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  // Delete in order to respect foreign key constraints
  const tables = [
    'lead_comments',
    'lead_evaluations', 
    'lead_emails',
    'lead_phone_calls',
    'leads'
  ];
  
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) {
      console.log(`Warning: Could not clear ${table}:`, error.message);
    }
  }
  
  console.log('✅ Existing data cleared');
}

async function seedLeads() {
  console.log('📋 Seeding leads...');
  
  const leads = mockData.leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    source: lead.source,
    notes: lead.notes,
    priority: lead.priority,
    assigned_to: YOUR_USER_ID,
    created_at: lead.created_at,
    updated_at: lead.updated_at
  }));
  
  const { error } = await supabase.from('leads').insert(leads);
  if (error) {
    console.error('Error seeding leads:', error);
    return false;
  }
  
  console.log(`✅ Seeded ${leads.length} leads`);
  return true;
}

async function seedPhoneCalls() {
  console.log('📞 Seeding phone calls...');
  
  const phoneCalls = mockData.phone_calls.map(call => ({
    id: call.id,
    lead_id: call.lead_id,
    call_date: call.call_date,
    duration: call.duration,
    transcript: call.transcript,
    call_outcome: call.call_outcome,
    ai_analysis: call.ai_analysis,
    created_at: call.created_at
  }));
  
  // Insert in batches to avoid timeout
  const batchSize = 20;
  let successCount = 0;
  
  for (let i = 0; i < phoneCalls.length; i += batchSize) {
    const batch = phoneCalls.slice(i, i + batchSize);
    const { error } = await supabase.from('lead_phone_calls').insert(batch);
    if (error) {
      console.error(`Error seeding phone calls batch ${i / batchSize + 1}:`, error.message);
    } else {
      successCount += batch.length;
    }
  }
  
  console.log(`✅ Seeded ${successCount} phone calls`);
}

async function seedEmails() {
  console.log('📧 Seeding emails...');
  
  const emails = mockData.emails.map(email => ({
    id: email.id,
    lead_id: email.lead_id,
    email_type: email.email_type,
    subject: email.subject,
    content: email.content,
    sent_at: email.sent_at,
    email_status: email.email_status,
    opened_at: email.opened_at,
    clicked_at: email.clicked_at,
    replied_at: email.replied_at
  }));
  
  // Insert in batches to avoid timeout
  const batchSize = 20;
  let successCount = 0;
  
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const { error } = await supabase.from('lead_emails').insert(batch);
    if (error) {
      console.error(`Error seeding emails batch ${i / batchSize + 1}:`, error.message);
    } else {
      successCount += batch.length;
    }
  }
  
  console.log(`✅ Seeded ${successCount} emails`);
}

async function seedEvaluations() {
  console.log('📊 Seeding evaluations...');
  
  const evaluations = mockData.evaluations.map(evaluation => ({
    id: evaluation.id,
    lead_id: evaluation.lead_id,
    evaluation_type: evaluation.evaluation_type,
    qualification_score: evaluation.qualification_score,
    evaluation_result: evaluation.evaluation_result,
    criteria_met: evaluation.criteria_met,
    confidence_score: evaluation.confidence_score,
    evaluator_version: evaluation.evaluator_version,
    created_at: evaluation.created_at
  }));
  
  const { error } = await supabase.from('lead_evaluations').insert(evaluations);
  if (error) {
    console.error('Error seeding evaluations:', error.message);
  } else {
    console.log(`✅ Seeded ${evaluations.length} evaluations`);
  }
}

async function seedComments() {
  console.log('💬 Seeding comments...');
  
  const comments = mockData.comments.map(comment => ({
    id: comment.id,
    lead_id: comment.lead_id,
    user_id: YOUR_USER_ID,
    content: comment.comment_text,
    is_internal: comment.is_internal,
    parent_id: comment.parent_comment_id || null,
    is_edited: false,
    created_at: comment.created_at,
    updated_at: comment.updated_at
  }));
  
  const { error } = await supabase.from('lead_comments').insert(comments);
  if (error) {
    console.error('Error seeding comments:', error.message);
  } else {
    console.log(`✅ Seeded ${comments.length} comments`);
  }
}

async function checkUserId() {
  if (YOUR_USER_ID === 'YOUR_SUPABASE_USER_ID_HERE') {
    console.error('❌ You need to set YOUR_USER_ID in the script!');
    console.error('\nTo find your user ID:');
    console.error('1. Go to your Supabase Dashboard');
    console.error('2. Navigate to Authentication > Users');
    console.error('3. Copy your user ID (it looks like: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)');
    console.error('4. Replace YOUR_SUPABASE_USER_ID_HERE in this script with your actual ID');
    return false;
  }
  return true;
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting Supabase database seeding...\n');
    
    // Check if user ID is set
    if (!await checkUserId()) {
      process.exit(1);
    }
    
    // Clear existing data
    await clearExistingData();
    
    // Seed data in order
    const leadsSuccess = await seedLeads();
    if (!leadsSuccess) {
      console.error('Failed to seed leads. Stopping.');
      process.exit(1);
    }
    
    await seedPhoneCalls();
    await seedEmails();
    await seedEvaluations();
    await seedComments();
    
    console.log('\n✅ Database seeding completed!');
    console.log('\n📌 Now you can log in with your existing account and see all the seeded data.');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();