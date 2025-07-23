#!/usr/bin/env node

/**
 * Database Setup Script for Supabase Integration
 * 
 * This script helps set up the database schema and seed data for the
 * Samantha Lead Generation application.
 * 
 * Usage:
 *   node scripts/setup-database.js --migrate    # Run migrations only
 *   node scripts/setup-database.js --seed      # Run seed only (requires tables to exist)
 *   node scripts/setup-database.js --full      # Run migrations and seed (default)
 * 
 * Prerequisites:
 *   1. Supabase project created and active
 *   2. Environment variables configured in .env.local
 *   3. Internet connectivity
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const COMMANDS = {
  migrate: '--migrate',
  seed: '--seed', 
  full: '--full'
};

class DatabaseSetup {
  constructor() {
    this.supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!this.supabaseUrl || !this.supabaseServiceKey) {
      console.error('❌ Missing Supabase environment variables.');
      console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
      process.exit(1);
    }

    this.supabase = createClient(this.supabaseUrl, this.supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  async testConnection() {
    console.log('🔍 Testing Supabase connection...');
    
    try {
      // Test with a simple query to check connection
      const { data, error } = await this.supabase
        .from('_test_connection')
        .select('count')
        .limit(1);
      
      // We expect an error about the table not existing, which is fine
      // What we're checking is that we can connect at all
      if (error && !error.message.includes('does not exist') && !error.message.includes('not found')) {
        throw new Error(`Connection failed: ${error.message}`);
      }
      
      console.log('✅ Successfully connected to Supabase');
      return true;
    } catch (err) {
      console.error('❌ Failed to connect to Supabase:', err.message);
      console.error('🔧 Please check:');
      console.error('  - Your internet connection');
      console.error('  - Supabase project is active (not paused)');
      console.error('  - Environment variables are correct');
      return false;
    }
  }

  async checkTablesExist() {
    try {
      const { data, error } = await this.supabase
        .from('leads')
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        if (error.message.includes('does not exist')) {
          return false;
        }
        throw error;
      }
      return true;
    } catch (err) {
      return false;
    }
  }

  async runMigrations() {
    console.log('🚀 Starting database migrations...');
    
    try {
      const migrationsDir = path.resolve(__dirname, '../supabase/migrations');
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      console.log(`Found ${migrationFiles.length} migration files to run`);

      for (const file of migrationFiles) {
        console.log(`📄 Running migration: ${file}`);
        
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // For this demo, we'll show what would be run
        // In a real scenario, you'd use the Supabase CLI or direct SQL execution
        console.log(`📝 Would execute SQL from ${file}`);
        console.log('💡 To run manually, execute the SQL in your Supabase SQL Editor:');
        console.log(`   ${this.supabaseUrl.replace('/rest/v1', '')}/project/default/sql`);
      }

      console.log('');
      console.log('⚠️  IMPORTANT: This script cannot automatically run migrations.');
      console.log('👉 Please run the migrations using one of these methods:');
      console.log('');
      console.log('Method 1 - Supabase CLI (Recommended):');
      console.log('  1. Install: npm install -g supabase (or use alternative install methods)');
      console.log('  2. Login: supabase login');
      console.log('  3. Link project: supabase link --project-ref YOUR_PROJECT_REF');
      console.log('  4. Push migrations: supabase db push');
      console.log('');
      console.log('Method 2 - Manual SQL Execution:');
      console.log('  1. Go to your Supabase project dashboard');
      console.log('  2. Navigate to SQL Editor');
      console.log('  3. Run each migration file in order:');
      migrationFiles.forEach(file => {
        console.log(`     - supabase/migrations/${file}`);
      });
      
      return false; // Indicate migrations weren't actually run
      
    } catch (error) {
      console.error('❌ Error during migration setup:', error.message);
      return false;
    }
  }

  async runSeeding() {
    console.log('🌱 Starting database seeding...');
    
    const tablesExist = await this.checkTablesExist();
    if (!tablesExist) {
      console.error('❌ Tables do not exist. Please run migrations first.');
      return false;
    }

    try {
      // Load mock data
      const mockDataPath = path.resolve(__dirname, '../src/data/mock.json');
      const mockData = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

      // Clear existing data
      console.log('🧹 Clearing existing data...');
      const tables = ['lead_comments', 'lead_evaluations', 'lead_emails', 'lead_phone_calls', 'leads'];
      
      for (const table of tables) {
        const { error } = await this.supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000');
        if (error) {
          console.log(`⚠️  Could not clear ${table}: ${error.message}`);
        }
      }

      // Seed leads
      console.log('👥 Seeding leads...');
      const leadsToInsert = mockData.leads.map(lead => ({
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

      const { error: leadsError } = await this.supabase
        .from('leads')
        .insert(leadsToInsert);

      if (leadsError) {
        throw new Error(`Error seeding leads: ${leadsError.message}`);
      }

      console.log(`✅ Inserted ${leadsToInsert.length} leads`);

      // Seed other tables with error handling
      await this.seedTable('lead_phone_calls', 'phone_calls', mockData, '📞');
      await this.seedTable('lead_emails', 'emails', mockData, '📧'); 
      await this.seedTable('lead_evaluations', 'evaluations', mockData, '📊');
      
      // Skip user profiles and comments for now (require auth setup)
      console.log('⚠️  Skipping user profiles and comments (require Supabase Auth setup)');

      console.log('🎉 Database seeding completed successfully!');
      return true;

    } catch (error) {
      console.error('❌ Error seeding database:', error.message);
      return false;
    }
  }

  async seedTable(tableName, dataKey, mockData, emoji) {
    console.log(`${emoji} Seeding ${tableName}...`);
    
    const dataToInsert = mockData[dataKey]?.map(item => {
      // Transform data based on table structure
      if (tableName === 'lead_phone_calls') {
        return {
          id: item.id,
          lead_id: item.lead_id,
          call_date: item.call_date,
          duration: item.duration,
          transcript: item.transcript,
          call_outcome: item.call_outcome,
          ai_analysis: item.ai_analysis,
          created_at: item.created_at
        };
      } else if (tableName === 'lead_emails') {
        return {
          id: item.id,
          lead_id: item.lead_id,
          email_type: item.email_type,
          subject: item.subject,
          content: item.content,
          sent_at: item.sent_at,
          opened_at: item.opened_at,
          clicked_at: item.clicked_at,
          replied_at: item.replied_at,
          email_status: item.email_status,
          created_at: item.sent_at
        };
      } else if (tableName === 'lead_evaluations') {
        return {
          id: item.id,
          lead_id: item.lead_id,
          evaluation_type: item.evaluation_type,
          qualification_score: item.qualification_score,
          evaluation_result: item.evaluation_result,
          criteria_met: item.criteria_met,
          confidence_score: item.confidence_score,
          created_at: item.created_at,
          evaluator_version: item.evaluator_version
        };
      }
      return item;
    });

    if (!dataToInsert || dataToInsert.length === 0) {
      console.log(`⚠️  No data found for ${tableName}`);
      return;
    }

    const { error } = await this.supabase
      .from(tableName)
      .insert(dataToInsert);

    if (error) {
      console.log(`⚠️  Error seeding ${tableName}: ${error.message}`);
    } else {
      console.log(`✅ Inserted ${dataToInsert.length} records into ${tableName}`);
    }
  }

  async run(command) {
    console.log('🏗️  Samantha Lead Gen - Database Setup');
    console.log('=====================================');
    console.log('');

    // Test connection first
    const connected = await this.testConnection();
    if (!connected) {
      process.exit(1);
    }

    let success = true;

    switch (command) {
      case COMMANDS.migrate:
        success = await this.runMigrations();
        break;
      
      case COMMANDS.seed:
        success = await this.runSeeding();
        break;
      
      case COMMANDS.full:
      default:
        const migrateSuccess = await this.runMigrations();
        if (migrateSuccess) {
          success = await this.runSeeding();
        } else {
          success = false;
        }
        break;
    }

    console.log('');
    console.log('=====================================');
    if (success) {
      console.log('🎉 Setup completed successfully!');
      console.log('🚀 You can now run: npm run dev');
    } else {
      console.log('⚠️  Setup completed with issues.');
      console.log('📖 Please check the output above and follow the manual steps.');
    }
    
    process.exit(success ? 0 : 1);
  }
}

// Parse command line arguments
const command = process.argv[2] || '--full';

if (!Object.values(COMMANDS).includes(command)) {
  console.error('❌ Invalid command. Use --migrate, --seed, or --full');
  process.exit(1);
}

// Run the setup
const setup = new DatabaseSetup();
setup.run(command).catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});