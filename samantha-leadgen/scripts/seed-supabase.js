require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const mockData = require('../src/data/mock.json');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Make sure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearExistingData() {
  console.log('🧹 Clearing existing data...');
  
  // Delete in order to respect foreign key constraints
  await supabase.from('lead_comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('lead_evaluations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('lead_emails').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('lead_phone_calls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('user_profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  
  console.log('✅ Existing data cleared');
}

async function seedUserProfiles() {
  console.log('👤 Seeding user profiles...');
  
  // First, we need to create auth users for each profile
  const userProfiles = [];
  
  for (const user of mockData.users) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: `${user.id}@example.com`,
      password: 'demo123456',
      email_confirm: true,
      user_metadata: {
        display_name: user.display_name
      }
    });
    
    if (authError) {
      console.error(`Error creating auth user ${user.id}:`, authError);
      continue;
    }
    
    // Create user profile
    const profile = {
      id: authData.user.id,
      display_name: user.display_name,
      role: user.role,
      avatar_url: user.avatar_url,
      created_at: user.created_at,
      updated_at: user.last_active
    };
    
    userProfiles.push(profile);
  }
  
  const { error } = await supabase.from('user_profiles').insert(userProfiles);
  if (error) {
    console.error('Error seeding user profiles:', error);
    return [];
  }
  
  console.log(`✅ Seeded ${userProfiles.length} user profiles`);
  return userProfiles;
}

async function seedLeads(userProfiles) {
  console.log('📋 Seeding leads...');
  
  // Map mock user IDs to real Supabase user IDs
  const userIdMap = {};
  mockData.users.forEach((mockUser, index) => {
    if (userProfiles[index]) {
      userIdMap[mockUser.id] = userProfiles[index].id;
    }
  });
  
  // Get a random user ID to assign leads to
  const randomUserId = userProfiles[0]?.id;
  
  const leads = mockData.leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    status: lead.status,
    source: lead.source,
    notes: lead.notes,
    priority: lead.priority,
    assigned_to: randomUserId, // Assign to first user
    created_at: lead.created_at,
    updated_at: lead.updated_at
  }));
  
  const { error } = await supabase.from('leads').insert(leads);
  if (error) {
    console.error('Error seeding leads:', error);
    return;
  }
  
  console.log(`✅ Seeded ${leads.length} leads`);
  return userIdMap;
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
  for (let i = 0; i < phoneCalls.length; i += batchSize) {
    const batch = phoneCalls.slice(i, i + batchSize);
    const { error } = await supabase.from('lead_phone_calls').insert(batch);
    if (error) {
      console.error(`Error seeding phone calls batch ${i / batchSize + 1}:`, error);
    }
  }
  
  console.log(`✅ Seeded ${phoneCalls.length} phone calls`);
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
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);
    const { error } = await supabase.from('lead_emails').insert(batch);
    if (error) {
      console.error(`Error seeding emails batch ${i / batchSize + 1}:`, error);
    }
  }
  
  console.log(`✅ Seeded ${emails.length} emails`);
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
    console.error('Error seeding evaluations:', error);
  }
  
  console.log(`✅ Seeded ${evaluations.length} evaluations`);
}

async function seedComments(userIdMap) {
  console.log('💬 Seeding comments...');
  
  const comments = mockData.comments.map(comment => ({
    id: comment.id,
    lead_id: comment.lead_id,
    user_id: userIdMap[comment.user_id] || Object.values(userIdMap)[0], // Map to real user ID
    content: comment.comment_text,
    is_internal: comment.is_internal,
    parent_id: comment.parent_comment_id || null,
    is_edited: false,
    created_at: comment.created_at,
    updated_at: comment.updated_at
  }));
  
  const { error } = await supabase.from('lead_comments').insert(comments);
  if (error) {
    console.error('Error seeding comments:', error);
  }
  
  console.log(`✅ Seeded ${comments.length} comments`);
}

async function seedDatabase() {
  try {
    console.log('🚀 Starting Supabase database seeding...\n');
    
    // Clear existing data
    await clearExistingData();
    
    // Seed data in order
    const userProfiles = await seedUserProfiles();
    const userIdMap = await seedLeads(userProfiles);
    await seedPhoneCalls();
    await seedEmails();
    await seedEvaluations();
    await seedComments(userIdMap);
    
    console.log('\n✅ Database seeding completed successfully!');
    console.log('\n📌 Demo account created:');
    console.log('   Email: user-001@example.com');
    console.log('   Password: demo123456');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();