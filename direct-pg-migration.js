#!/usr/bin/env node

const fs = require('fs');

console.log('🚀 Creating user_notes table via direct connection...');

// Since direct SQL execution methods aren't working, let's provide clear manual instructions
console.log(`
✨ MANUAL TABLE CREATION REQUIRED ✨

The automated SQL execution isn't working through the APIs. Please follow these steps:

1. Go to https://supabase.com/dashboard/project/anoupmenvlacdpqcrvzw
2. Click on "SQL Editor" in the left sidebar  
3. Copy and paste this SQL:

`);

const migrationSQL = fs.readFileSync('supabase/migrations/20250811154602_create_user_notes_table.sql', 'utf8');
console.log('```sql');
console.log(migrationSQL);
console.log('```');

console.log(`
4. Click "RUN" to execute the SQL
5. You should see a success message
6. The Notes will then persist after refresh

The migration file has been created at:
📁 supabase/migrations/20250811154602_create_user_notes_table.sql

After running the SQL in the dashboard, test the Notes functionality!
`);

// Let's also test if the table exists already
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://anoupmenvlacdpqcrvzw.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  console.log('🔍 Checking if user_notes table already exists...');
  
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);
    
    if (!error) {
      console.log('✅ Great! Table user_notes already exists and is working!');
      console.log('🎉 Notes should already be persisting after refresh.');
      return true;
    } else if (error.code === 'PGRST116') {
      console.log('❌ Table user_notes does not exist yet - please run the SQL above');
      return false;
    } else {
      console.log('⚠️  Unexpected error checking table:', error);
      return false;
    }
  } catch (err) {
    console.log('⚠️  Exception checking table:', err.message);
    return false;
  }
}

checkTable();