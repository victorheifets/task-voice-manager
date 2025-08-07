#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://anoupmenvlacdpqcrvzw.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I';

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixDatabaseSchema() {
  console.log('🔧 Fixing database schema...');
  
  try {
    // SQL commands to add missing columns
    const sqlCommands = [
      "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS assignee VARCHAR(255);",
      "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS tags TEXT[];", 
      "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'medium';",
      "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ;",
      "ALTER TABLE tasks ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT FALSE;"
    ];

    // Execute each command
    for (const sql of sqlCommands) {
      console.log(`Executing: ${sql}`);
      const { data, error } = await supabase.rpc('exec', { sql });
      
      if (error) {
        console.error(`❌ Error executing SQL: ${error.message}`);
        // Try direct query instead
        const { data: directData, error: directError } = await supabase
          .from('information_schema.columns')
          .select('*')
          .eq('table_name', 'tasks');
          
        if (directError) {
          console.error(`❌ Direct query also failed: ${directError.message}`);
        }
      } else {
        console.log(`✅ Successfully executed: ${sql}`);
      }
    }

    // Verify the schema
    console.log('\n📋 Verifying current schema...');
    const { data: columns, error: schemaError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'tasks')
      .order('ordinal_position');

    if (schemaError) {
      console.error('❌ Error retrieving schema:', schemaError.message);
      
      // Try a different approach - check if we can query the tasks table directly
      console.log('🔍 Trying alternative approach...');
      const { data: testData, error: testError } = await supabase
        .from('tasks')
        .select('*')
        .limit(1);
        
      if (testError) {
        console.error('❌ Cannot access tasks table:', testError.message);
      } else {
        console.log('✅ Tasks table is accessible');
        console.log('Sample data structure:', Object.keys(testData[0] || {}));
      }
    } else {
      console.log('✅ Current tasks table schema:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `default: ${col.column_default}` : ''}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the fix
fixDatabaseSchema();