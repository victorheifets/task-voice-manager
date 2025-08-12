const https = require('https');

async function createUserNotesTableViaREST() {
  console.log('🚀 Creating user_notes table via Supabase Management API...');
  
  const accessToken = 'sbp_77f2af0bf79cc286b33fccfcb300ced7af2bda90';
  const projectRef = 'anoupmenvlacdpqcrvzw';
  
  // SQL to create the table
  const sql = `
    CREATE TABLE IF NOT EXISTS public.user_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Users can view own notes" ON public.user_notes;
    DROP POLICY IF EXISTS "Users can insert own notes" ON public.user_notes;
    DROP POLICY IF EXISTS "Users can update own notes" ON public.user_notes;
    DROP POLICY IF EXISTS "Users can delete own notes" ON public.user_notes;

    CREATE POLICY "Users can view own notes" ON public.user_notes
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own notes" ON public.user_notes
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own notes" ON public.user_notes
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own notes" ON public.user_notes
        FOR DELETE USING (auth.uid() = user_id);

    CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);

    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    DROP TRIGGER IF EXISTS update_user_notes_updated_at ON public.user_notes;

    CREATE TRIGGER update_user_notes_updated_at 
        BEFORE UPDATE ON public.user_notes 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    console.log('📡 Calling Supabase Management API...');
    
    // Use the Management API to execute SQL
    const response = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: sql
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Management API call failed:', response.status, errorText);
      
      // Try alternative approach using database webhooks or functions
      console.log('🔄 Trying alternative approach...');
      
      // Try using the database REST API directly
      const directResponse = await fetch(`https://anoupmenvlacdpqcrvzw.supabase.co/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ***REMOVED***`,
          'Content-Type': 'application/json',
          'apikey': '***REMOVED***'
        },
        body: JSON.stringify({ sql: sql })
      });
      
      if (!directResponse.ok) {
        console.error('❌ Direct API call also failed:', directResponse.status, await directResponse.text());
        return false;
      }
      
      console.log('✅ Table created via direct API');
      return true;
    }

    const result = await response.json();
    console.log('✅ Table created successfully via Management API');
    console.log('📋 Result:', result);
    return true;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  }
}

// Test if table exists
async function testTableExists() {
  console.log('🔍 Testing if user_notes table exists...');
  
  const { createClient } = require('@supabase/supabase-js');
  
  const supabase = createClient(
    'https://anoupmenvlacdpqcrvzw.supabase.co',
    '***REMOVED***'
  );

  try {
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);

    if (error && error.code === 'PGRST116') {
      console.log('❌ Table does not exist');
      return false;
    } else if (error) {
      console.log('⚠️ Unexpected error:', error);
      return false;
    } else {
      console.log('✅ Table exists and is accessible!');
      return true;
    }
  } catch (verifyError) {
    console.log('❌ Verification failed:', verifyError.message);
    return false;
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting user_notes table creation process...\n');
  
  // First check if table already exists
  const exists = await testTableExists();
  
  if (exists) {
    console.log('\n🎉 Table already exists! No action needed.');
    return true;
  }
  
  console.log('\n📋 Table does not exist, creating...');
  const created = await createUserNotesTableViaREST();
  
  if (created) {
    // Verify creation
    console.log('\n🔍 Verifying table creation...');
    const verified = await testTableExists();
    
    if (verified) {
      console.log('\n🎉 SUCCESS: user_notes table created and verified!');
      console.log('📝 Notes functionality is now ready for database storage');
      return true;
    } else {
      console.log('\n❌ Table creation may have failed - verification unsuccessful');
      return false;
    }
  } else {
    console.log('\n❌ Failed to create table via REST API');
    console.log('\n📋 Manual SQL (copy to Supabase Dashboard):');
    console.log('-- Go to: https://supabase.com/dashboard/project/anoupmenvlacdpqcrvzw');
    console.log('-- Click: SQL Editor');
    console.log('-- Paste and run this SQL:');
    console.log(`
CREATE TABLE IF NOT EXISTS public.user_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.user_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes" ON public.user_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes" ON public.user_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes" ON public.user_notes
    FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);
    `);
    return false;
  }
}

main()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });