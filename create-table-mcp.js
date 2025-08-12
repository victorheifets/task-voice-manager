const { createClient } = require('@supabase/supabase-js');

// Use the same config as MCP
const supabaseUrl = 'https://anoupmenvlacdpqcrvzw.supabase.co';
const supabaseServiceKey = '***REMOVED***';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createUserNotesTable() {
  console.log('🚀 Creating user_notes table using MCP configuration...');

  try {
    // Step 1: Create table
    console.log('📋 Creating table...');
    const { data: createData, error: createError } = await supabase.rpc('exec_sql', {
      query: `
        CREATE TABLE IF NOT EXISTS user_notes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            tab_id INTEGER NOT NULL,
            content TEXT DEFAULT '',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE(user_id, tab_id)
        );
      `
    });

    if (createError) {
      console.log('❌ exec_sql not available, trying direct PostgreSQL approach...');
      
      // Alternative: Use raw SQL through a custom function if available
      const { data: rawData, error: rawError } = await supabase
        .from('user_notes')  // This will fail if table doesn't exist, which we can use to detect
        .select('*')
        .limit(1);
      
      if (rawError && rawError.code === 'PGRST205') {
        console.log('✅ Confirmed: Table does not exist');
        console.log('📖 Please run this SQL manually in Supabase SQL Editor:');
        console.log('');
        console.log('-- Create user_notes table for storing note tabs');
        console.log('CREATE TABLE IF NOT EXISTS user_notes (');
        console.log('    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),');
        console.log('    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,');
        console.log('    tab_id INTEGER NOT NULL,');
        console.log('    content TEXT DEFAULT \'\',');
        console.log('    created_at TIMESTAMPTZ DEFAULT NOW(),');
        console.log('    updated_at TIMESTAMPTZ DEFAULT NOW(),');
        console.log('    UNIQUE(user_id, tab_id)');
        console.log(');');
        console.log('');
        console.log('-- Enable Row Level Security');
        console.log('ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- Create policies');
        console.log('CREATE POLICY "Users can view their own notes" ON user_notes');
        console.log('    FOR SELECT USING (auth.uid() = user_id);');
        console.log('');
        console.log('CREATE POLICY "Users can insert their own notes" ON user_notes');
        console.log('    FOR INSERT WITH CHECK (auth.uid() = user_id);');
        console.log('');
        console.log('CREATE POLICY "Users can update their own notes" ON user_notes');
        console.log('    FOR UPDATE USING (auth.uid() = user_id);');
        console.log('');
        console.log('CREATE POLICY "Users can delete their own notes" ON user_notes');
        console.log('    FOR DELETE USING (auth.uid() = user_id);');
        console.log('');
        console.log('-- Create indexes');
        console.log('CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);');
        console.log('CREATE INDEX IF NOT EXISTS idx_user_notes_tab_id ON user_notes(user_id, tab_id);');
        return;
      } else if (!rawError) {
        console.log('✅ Table already exists!');
        return;
      }
    }

    // Step 2: Enable RLS
    console.log('🔒 Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      query: 'ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;'
    });

    // Step 3: Create policies (ignore errors if they exist)
    console.log('🔐 Creating security policies...');
    const policies = [
      'CREATE POLICY IF NOT EXISTS "Users can view their own notes" ON user_notes FOR SELECT USING (auth.uid() = user_id);',
      'CREATE POLICY IF NOT EXISTS "Users can insert their own notes" ON user_notes FOR INSERT WITH CHECK (auth.uid() = user_id);',
      'CREATE POLICY IF NOT EXISTS "Users can update their own notes" ON user_notes FOR UPDATE USING (auth.uid() = user_id);',
      'CREATE POLICY IF NOT EXISTS "Users can delete their own notes" ON user_notes FOR DELETE USING (auth.uid() = user_id);'
    ];

    for (const policy of policies) {
      await supabase.rpc('exec_sql', { query: policy });
    }

    // Step 4: Create indexes
    console.log('⚡ Creating indexes...');
    await supabase.rpc('exec_sql', {
      query: 'CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);'
    });
    await supabase.rpc('exec_sql', {
      query: 'CREATE INDEX IF NOT EXISTS idx_user_notes_tab_id ON user_notes(user_id, tab_id);'
    });

    // Step 5: Test access
    console.log('🔍 Testing table access...');
    const { data: testData, error: testError } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);

    if (testError) {
      console.error('❌ Table access test failed:', testError);
    } else {
      console.log('✅ Success! user_notes table created and accessible via MCP!');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

createUserNotesTable();