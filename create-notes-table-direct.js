const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '***REMOVED***';

if (!supabaseUrl) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserNotesTable() {
  console.log('🚀 Creating user_notes table with service role key...');
  
  try {
    // Raw SQL execution
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create user_notes table for storing note tabs
        CREATE TABLE IF NOT EXISTS user_notes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            tab_id INTEGER NOT NULL,
            content TEXT DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, tab_id)
        );

        -- Enable Row Level Security
        ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

        -- Create policies for user_notes
        CREATE POLICY IF NOT EXISTS "Users can view their own notes" ON user_notes
            FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own notes" ON user_notes
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own notes" ON user_notes
            FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own notes" ON user_notes
            FOR DELETE USING (auth.uid() = user_id);

        -- Create indexes for better performance
        CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_notes_tab_id ON user_notes(user_id, tab_id);
      `
    });

    if (error) {
      console.error('❌ Error executing SQL:', error);
      
      // Try alternative approach - create table step by step
      console.log('🔄 Trying step-by-step creation...');
      
      const queries = [
        `CREATE TABLE IF NOT EXISTS user_notes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            tab_id INTEGER NOT NULL,
            content TEXT DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, tab_id)
        );`,
        `ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;`,
        `CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);`,
        `CREATE INDEX IF NOT EXISTS idx_user_notes_tab_id ON user_notes(user_id, tab_id);`
      ];

      for (let i = 0; i < queries.length; i++) {
        const { error: queryError } = await supabase.rpc('exec_sql', { sql: queries[i] });
        if (queryError) {
          console.error(`❌ Error in query ${i + 1}:`, queryError);
        } else {
          console.log(`✅ Query ${i + 1} executed successfully`);
        }
      }
    } else {
      console.log('✅ Table created successfully:', data);
    }

    // Test table access
    console.log('🔍 Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Table access test failed:', testError);
    } else {
      console.log('✅ Table exists and is accessible!');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

createUserNotesTable();