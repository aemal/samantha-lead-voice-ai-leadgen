const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables explicitly
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local') });

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment check:');
console.log('URL:', supabaseUrl ? '✅ Loaded' : '❌ Missing');
console.log('Service Key:', supabaseServiceKey ? '✅ Loaded' : '❌ Missing');

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Load mock data
const mockDataPath = path.resolve(__dirname, '../../src/data/mock.json');
const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

async function seedDatabase() {
  console.log('🌱 Starting database seed...');

  try {
    // Test connection and check if tables exist
    console.log('🔌 Testing Supabase connection...');
    const { data: testData, error: testError } = await supabase
      .from('leads')
      .select('count', { count: 'exact', head: true });
    
    if (testError) {
      console.log('❌ Connection test failed:', JSON.stringify(testError, null, 2));
      throw new Error(`Database connection failed: ${testError.message || JSON.stringify(testError)}`);
    }
    
    console.log('✅ Connection successful');
    
    // Check if tables exist by querying table structure
    console.log('🔍 Checking if leads table exists...');
    const { data: tableCheck, error: tableError } = await supabase
      .rpc('to_json', { query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'leads'" })
      .single();
    
    if (tableError) {
      // Try a different approach - select with limit 0
      const { error: selectError } = await supabase
        .from('leads')
        .select('*')
        .limit(0);
        
      if (selectError && selectError.code === '42P01') {
        console.log('❌ Table "leads" does not exist! Please run migrations first.');
        console.log('   Run: npm run setup:migrate');
        throw new Error('Database tables not found. Please run migrations.');
      }
    }
    
    // Test inserting one lead without ID (let DB generate UUID)
    console.log('🧪 Testing single insert without ID...');
    const { data: testInsert, error: testInsertError } = await supabase
      .from('leads')
      .insert({
        name: 'Test User',
        email: 'test@example.com',
        status: 'lead'
      })
      .select()
      .single();
      
    if (testInsertError) {
      console.log('❌ Test insert failed:', JSON.stringify(testInsertError, null, 2));
      console.log('Error code:', testInsertError.code);
      console.log('Error hint:', testInsertError.hint);
      console.log('Error details:', testInsertError.details);
      console.log('Error message:', testInsertError.message);
    } else {
      console.log('✅ Test insert successful:', testInsert);
      // Clean up test record
      await supabase.from('leads').delete().eq('id', testInsert.id);
    }

    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await supabase.from('lead_comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_evaluations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_emails').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('lead_phone_calls').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('leads').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Seed leads
    console.log('👥 Seeding leads...');
    // Remove ID field - let Supabase generate UUIDs
    const leadsToInsert = mockData.leads.map((lead) => ({
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

    console.log('📝 Sample lead data:', JSON.stringify(leadsToInsert[0], null, 2));
    console.log(`📊 Attempting to insert ${leadsToInsert.length} leads`);

    const { data: insertedLeads, error: leadsError } = await supabase
      .from('leads')
      .insert(leadsToInsert)
      .select();

    if (leadsError) {
      console.log('🔍 Full error object:', leadsError);
      console.log('🔍 Error details:', JSON.stringify(leadsError, null, 2));
      throw new Error(`Error seeding leads: ${leadsError.message || leadsError.details || leadsError.hint || JSON.stringify(leadsError)}`);
    }

    console.log(`✅ Inserted ${insertedLeads.length} leads`);
    
    // Create mapping from original IDs to new UUIDs for related data
    const leadIdMapping = {};
    mockData.leads.forEach((originalLead, index) => {
      if (insertedLeads[index]) {
        leadIdMapping[originalLead.id] = insertedLeads[index].id;
      }
    });

    // Seed phone calls
    console.log('📞 Seeding phone calls...');
    const callsToInsert = mockData.phone_calls
      .filter(call => leadIdMapping[call.lead_id]) // Only include calls for leads that were inserted
      .map((call) => ({
        lead_id: leadIdMapping[call.lead_id], // Map to new UUID
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
      throw new Error(`Error seeding phone calls: ${callsError.message || JSON.stringify(callsError)}`);
    }

    console.log(`✅ Inserted ${callsToInsert.length} phone calls`);

    // Seed emails
    console.log('📧 Seeding emails...');
    const emailsToInsert = mockData.emails
      .filter(email => leadIdMapping[email.lead_id])
      .map((email) => ({
        lead_id: leadIdMapping[email.lead_id],
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
      throw new Error(`Error seeding emails: ${emailsError.message || JSON.stringify(emailsError)}`);
    }

    console.log(`✅ Inserted ${emailsToInsert.length} emails`);

    // Seed evaluations
    console.log('📊 Seeding evaluations...');
    const evaluationsToInsert = mockData.evaluations
      .filter(evaluation => leadIdMapping[evaluation.lead_id])
      .map((evaluation) => ({
        lead_id: leadIdMapping[evaluation.lead_id],
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
      throw new Error(`Error seeding evaluations: ${evaluationsError.message || JSON.stringify(evaluationsError)}`);
    }

    console.log(`✅ Inserted ${evaluationsToInsert.length} evaluations`);

    // Create a default auth user and profile for demo purposes
    console.log('👤 Creating demo user profile...');
    
    // Note: In a real implementation, you would create auth users through Supabase Auth
    // For this demo, we'll create user profiles directly (remove IDs to let DB generate)
    const userProfilesToInsert = mockData.users.map((user) => ({
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
      console.log('User error:', userError.message || JSON.stringify(userError));
    } else {
      console.log(`✅ Inserted ${userProfilesToInsert.length} user profiles`);
    }

    // Seed comments (skip user_id validation for demo)
    console.log('💬 Seeding comments...');
    const commentsToInsert = mockData.comments
      .filter(comment => leadIdMapping[comment.lead_id])
      .map((comment) => ({
        lead_id: leadIdMapping[comment.lead_id],
        user_id: comment.user_id, // Keep original user_id for now
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
      console.log('Comments error:', commentsError.message || JSON.stringify(commentsError));
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