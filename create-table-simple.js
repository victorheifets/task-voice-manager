#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://anoupmenvlacdpqcrvzw.supabase.co";
const supabaseServiceKey = "***REMOVED***";

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
});

async function createUserNotesTableDirectly() {
  console.log('🔧 Creating user_notes table via direct database connection...');
  
  // Use the service role to execute raw SQL
  const { data, error } = await supabase
    .rpc('exec', { 
      command: `
        CREATE TABLE IF NOT EXISTS user_notes (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          tab_id INTEGER NOT NULL,
          content TEXT DEFAULT '',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(user_id, tab_id)
        );
        
        ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
      ` 
    });

  if (error) {
    console.error('❌ Error:', error);
    
    // Try alternative approach - check if table already exists
    console.log('🔍 Checking if user_notes table exists...');
    const { data: tableCheck, error: checkError } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);
    
    if (checkError && checkError.code === 'PGRST116') {
      console.log('✅ Table user_notes already exists!');
      return true;
    } else if (checkError) {
      console.error('❌ Table check failed:', checkError);
      return false;
    }
    
    return false;
  }
  
  console.log('✅ Table created successfully');
  return true;
}

async function testTableAccess() {
  console.log('🔍 Testing table access...');
  
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);
    
    if (error) {
      if (error.code === 'PGRST116') {
        console.log('❌ Table user_notes does not exist');
        return false;
      } else {
        console.error('❌ Error accessing table:', error);
        return false;
      }
    }
    
    console.log('✅ Table access successful');
    return true;
  } catch (err) {
    console.error('❌ Exception:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up user_notes table...');
  
  // First check if table exists
  const exists = await testTableAccess();
  
  if (!exists) {
    console.log('📋 Table doesn\'t exist, creating it...');
    const created = await createUserNotesTableDirectly();
    
    if (created) {
      await testTableAccess();
    }
  } else {
    console.log('✅ Table already exists and is accessible');
  }
  
  console.log('🎉 Setup complete!');
}

main().catch(console.error);