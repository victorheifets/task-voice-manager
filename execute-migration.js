#!/usr/bin/env node

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration from .env.mcp
const supabaseUrl = "https://anoupmenvlacdpqcrvzw.supabase.co";
const supabaseServiceKey = "***REMOVED***";

async function executeMigration() {
  console.log('🚀 Executing user_notes migration...');
  
  // Read the migration file
  const migrationSQL = fs.readFileSync('supabase/migrations/20250811154602_create_user_notes_table.sql', 'utf8');
  console.log('📋 Migration SQL loaded');
  
  // Create Supabase client with service role key
  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  // Split the SQL into individual statements
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
  
  console.log(`📄 Found ${statements.length} SQL statements to execute`);

  // Execute each statement individually using raw SQL
  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';
    console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);
    
    try {
      // Use fetch to execute raw SQL via Supabase Edge Functions or direct API
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/sql',
          'Accept': 'application/json'
        },
        body: statement
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log(`⚠️  Statement ${i + 1} response: ${response.status} ${response.statusText}`);
        console.log(`📝 Response: ${errorText}`);
        
        // Continue with next statement for CREATE IF NOT EXISTS or similar
        if (statement.includes('IF NOT EXISTS') || statement.includes('CREATE POLICY')) {
          console.log(`✅ Statement ${i + 1} completed (may already exist)`);
          continue;
        }
      } else {
        console.log(`✅ Statement ${i + 1} executed successfully`);
      }
    } catch (error) {
      console.error(`❌ Error executing statement ${i + 1}:`, error.message);
    }
  }
  
  // Verify table was created
  console.log('🔍 Verifying table creation...');
  
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Table user_notes still does not exist');
        return false;
      } else {
        console.error('❌ Error verifying table:', error);
        return false;
      }
    }
    
    console.log('✅ Table user_notes verified successfully!');
    console.log('🎉 Migration completed successfully!');
    return true;
  } catch (err) {
    console.error('❌ Verification exception:', err.message);
    return false;
  }
}

// Run the migration
executeMigration()
  .then((success) => {
    if (success) {
      console.log('🎊 All done! Notes should now persist after refresh.');
      process.exit(0);
    } else {
      console.log('❌ Migration failed. Please check the logs above.');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });