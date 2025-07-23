const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Environment Variables:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'Missing');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection...\n');

  // Test 1: Basic table query
  console.log('Test 1: Query non-existent table (should fail gracefully)');
  try {
    const { data, error } = await supabase
      .from('test_table')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Expected error:', error.message);
      console.log('Error code:', error.code);
      if (error.code === '42P01') {
        console.log('✅ Connection works! Table does not exist (expected)');
      }
    } else {
      console.log('Data:', data);
    }
  } catch (e) {
    console.error('Caught error:', e.message);
  }

  console.log('\nTest 2: Try to query leads table');
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Error:', error.message);
      console.log('Error code:', error.code);
      console.log('Full error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ Leads table exists!');
      console.log('Data:', data);
    }
  } catch (e) {
    console.error('Caught error:', e.message);
  }

  console.log('\nTest 3: Check auth configuration');
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.log('Auth error (expected with service role):', error.message);
    } else {
      console.log('Auth user:', user);
    }
  } catch (e) {
    console.error('Auth error:', e.message);
  }
}

testConnection().catch(console.error);