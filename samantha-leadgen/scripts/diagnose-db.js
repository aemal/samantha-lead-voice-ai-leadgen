const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Supabase Connection Diagnostics');
console.log('================================');
console.log('URL:', supabaseUrl);
console.log('Service Key:', supabaseServiceKey ? '***PRESENT***' : '❌ MISSING');
console.log('');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Environment variables are missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function diagnose() {
  console.log('🔍 Testing connection...');
  
  try {
    // Test 1: Basic connection
    const { data, error } = await supabase
      .from('leads')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      if (error.message.includes('relation "leads" does not exist')) {
        console.log('✅ Connection successful, but tables do not exist');
        console.log('💡 Solution: Run the database migrations first');
        console.log('');
        console.log('Next steps:');
        console.log('1. Go to your Supabase dashboard > SQL Editor');
        console.log('2. Run each migration file from supabase/migrations/ in order');
        console.log('3. Then run: npm run seed');
        return true;
      } else {
        console.log('❌ Connection error:', error.message);
        console.log('🔍 Error details:', error);
        return false;
      }
    } else {
      console.log('✅ Connection successful! Tables exist.');
      console.log('📊 Leads table has', data || 0, 'records');
      return true;
    }
  } catch (err) {
    console.log('❌ Network/Connection error:', err.message);
    console.log('');
    console.log('🔧 Troubleshooting steps:');
    console.log('1. Check internet connection');
    console.log('2. Verify Supabase project is not paused');
    console.log('3. Confirm environment variables are correct');
    console.log('4. Try accessing your Supabase dashboard directly');
    return false;
  }
}

diagnose();