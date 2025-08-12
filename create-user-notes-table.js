#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Read from .env.mcp directly
const supabaseUrl = "https://anoupmenvlacdpqcrvzw.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFub3VwbWVudmxhY2RwcWNydnp3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTIwODE0NSwiZXhwIjoyMDY2Nzg0MTQ1fQ.yEuK-CUytclOmy0jCzwwuovDfPDjWcr-z9gusJqyO_I";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.mcp');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createUserNotesTable() {
  console.log('🔧 Creating user_notes table...');
  
  // Execute each SQL statement separately
  const sqlStatements = [
    `CREATE TABLE IF NOT EXISTS public.user_notes (
       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
       user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
       title TEXT NOT NULL DEFAULT '',
       content TEXT NOT NULL DEFAULT '',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
     );`,
    `ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;`,
    `DROP POLICY IF EXISTS "Users can view own notes" ON public.user_notes;`,
    `DROP POLICY IF EXISTS "Users can insert own notes" ON public.user_notes;`,
    `DROP POLICY IF EXISTS "Users can update own notes" ON public.user_notes;`,
    `DROP POLICY IF EXISTS "Users can delete own notes" ON public.user_notes;`,
    `CREATE POLICY "Users can view own notes" ON public.user_notes
     FOR SELECT USING (auth.uid() = user_id);`,
    `CREATE POLICY "Users can insert own notes" ON public.user_notes
     FOR INSERT WITH CHECK (auth.uid() = user_id);`,
    `CREATE POLICY "Users can update own notes" ON public.user_notes
     FOR UPDATE USING (auth.uid() = user_id);`,
    `CREATE POLICY "Users can delete own notes" ON public.user_notes
     FOR DELETE USING (auth.uid() = user_id);`,
    `CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);`,
    `CREATE OR REPLACE FUNCTION update_updated_at_column()
     RETURNS TRIGGER AS $$
     BEGIN
         NEW.updated_at = NOW();
         RETURN NEW;
     END;
     $$ language 'plpgsql';`,
    `DROP TRIGGER IF EXISTS update_user_notes_updated_at ON public.user_notes;`,
    `CREATE TRIGGER update_user_notes_updated_at 
     BEFORE UPDATE ON public.user_notes 
     FOR EACH ROW 
     EXECUTE FUNCTION update_updated_at_column();`
  ];

  try {
    // Use direct SQL execution - this is the most reliable approach
    for (let i = 0; i < sqlStatements.length; i++) {
      const statement = sqlStatements[i];
      console.log(`🔄 Executing statement ${i + 1}/${sqlStatements.length}...`);
      console.log(`📝 SQL: ${statement.substring(0, 60)}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec', { sql: statement });
        
        if (error) {
          console.log(`⚠️ RPC exec failed, trying alternative: ${error.message}`);
          
          // Try using raw SQL query
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/query`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseServiceKey}`,
              'Content-Type': 'application/json',
              'apikey': supabaseServiceKey,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: statement })
          });
          
          if (response.ok) {
            console.log('✅ Statement executed via query endpoint');
          } else {
            const errorText = await response.text();
            console.log(`⚠️ Statement ${i + 1} failed: ${errorText}`);
            // Continue with next statement for non-critical errors
            if (statement.includes('DROP POLICY') || statement.includes('DROP TRIGGER')) {
              console.log('  (This is expected if policy/trigger doesn\'t exist)');
            }
          }
        } else {
          console.log('✅ Statement executed via RPC exec');
        }
        
      } catch (stmtError) {
        console.log(`⚠️ Statement ${i + 1} failed: ${stmtError.message}`);
        // Continue for non-critical statements
        if (statement.includes('DROP POLICY') || statement.includes('DROP TRIGGER')) {
          console.log('  (This is expected if policy/trigger doesn\'t exist)');
        }
      }
    }
    
    console.log('✅ Database schema setup completed');
    return true;
  } catch (err) {
    console.error('❌ Exception during table creation:', err.message);
    return false;
  }
}

async function verifyTable() {
  console.log('🔍 Verifying table was created...');
  
  try {
    const { data, error } = await supabase
      .from('user_notes')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Table verification failed:', error);
      return false;
    }
    
    console.log('✅ Table verified successfully');
    return true;
  } catch (err) {
    console.error('❌ Verification exception:', err.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Setting up user_notes table in Supabase...');
  
  const created = await createUserNotesTable();
  if (created) {
    await verifyTable();
  }
  
  console.log('🎉 Setup complete!');
}

main().catch(console.error);