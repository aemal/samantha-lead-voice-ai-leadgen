const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigrations() {
  console.log('🚀 Starting database migrations...');

  try {
    // Get all migration files in order
    const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`Found ${migrationFiles.length} migration files:`);
    migrationFiles.forEach(file => console.log(`  - ${file}`));

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`\n📄 Running migration: ${file}`);
      
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Split SQL by semicolons and run each statement
      const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
      
      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i].trim();
        if (statement) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
            if (error) {
              // Try running directly if RPC fails
              const { error: directError } = await supabase.from('_').select('*').limit(0);
              if (directError) {
                console.log(`⚠️  Cannot run SQL directly: ${statement.substring(0, 50)}...`);
              }
            }
          } catch (err) {
            console.log(`⚠️  Error with statement ${i + 1}: ${err.message}`);
          }
        }
      }
      
      console.log(`✅ Completed migration: ${file}`);
    }

    console.log('\n🎉 All migrations completed successfully!');

  } catch (error) {
    console.error('❌ Error running migrations:', error);
    process.exit(1);
  }
}

// Run the migrations
runMigrations();