const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function createTable() {
  console.log('🚀 Testing user_notes table access...');
  
  const supabase = createClient(
    "https://anoupmenvlacdpqcrvzw.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I"
  );
  
  // Test table access
  const { data, error } = await supabase.from('user_notes').select('*').limit(1);
  
  if (error && error.code === 'PGRST116') {
    console.log('❌ Table does not exist - manual creation required');
    console.log('');
    console.log('🔗 MANUAL STEPS REQUIRED:');
    console.log('1. Go to https://supabase.com/dashboard/project/anoupmenvlacdpqcrvzw');
    console.log('2. Click "SQL Editor" in left sidebar');
    console.log('3. Copy/paste the SQL from: supabase/migrations/20250811154602_create_user_notes_table.sql');
    console.log('4. Click "RUN"');
    console.log('');
    console.log('📋 SQL TO RUN:');
    const sql = fs.readFileSync('supabase/migrations/20250811154602_create_user_notes_table.sql', 'utf8');
    console.log('```sql');
    console.log(sql);
    console.log('```');
    process.exit(1);
  } else if (error) {
    console.log('⚠️ Unexpected error:', error);
    process.exit(1);
  } else {
    console.log('✅ Table user_notes exists and is accessible!');
    console.log('🎉 Notes will now persist after refresh!');
    process.exit(0);
  }
}

createTable().catch(console.error);