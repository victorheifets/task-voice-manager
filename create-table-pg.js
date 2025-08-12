const { Client } = require('pg');

// Direct PostgreSQL connection using Supabase connection string
async function createUserNotesTable() {
  console.log('🚀 Creating user_notes table via direct PostgreSQL connection...');
  
  // Parse Supabase URL to get connection details
  const supabaseUrl = 'https://anoupmenvlacdpqcrvzw.supabase.co';
  const serviceKey = '***REMOVED***';
  
  // Supabase PostgreSQL connection details
  const client = new Client({
    host: 'db.anoupmenvlacdpqcrvzw.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'aqGKyL4GRgaFwWYx', // You'll need to provide this
    ssl: {
      rejectUnauthorized: false
    }
  });

  const createTableSQL = `
    -- Create user_notes table
    CREATE TABLE IF NOT EXISTS public.user_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        title TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own notes" ON public.user_notes;
    DROP POLICY IF EXISTS "Users can insert own notes" ON public.user_notes;
    DROP POLICY IF EXISTS "Users can update own notes" ON public.user_notes;
    DROP POLICY IF EXISTS "Users can delete own notes" ON public.user_notes;

    -- Create policies
    CREATE POLICY "Users can view own notes" ON public.user_notes
        FOR SELECT USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert own notes" ON public.user_notes
        FOR INSERT WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update own notes" ON public.user_notes
        FOR UPDATE USING (auth.uid() = user_id);

    CREATE POLICY "Users can delete own notes" ON public.user_notes
        FOR DELETE USING (auth.uid() = user_id);

    -- Create index for better performance
    CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON public.user_notes(user_id);

    -- Create update trigger function
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';

    -- Drop existing trigger if it exists
    DROP TRIGGER IF EXISTS update_user_notes_updated_at ON public.user_notes;

    -- Create update trigger
    CREATE TRIGGER update_user_notes_updated_at 
        BEFORE UPDATE ON public.user_notes 
        FOR EACH ROW 
        EXECUTE FUNCTION update_updated_at_column();
  `;

  try {
    console.log('📡 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    console.log('🔧 Executing table creation SQL...');
    await client.query(createTableSQL);
    console.log('✅ Table created successfully');

    // Verify table exists
    console.log('🔍 Verifying table creation...');
    const result = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'user_notes'
      ORDER BY ordinal_position;
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification successful!');
      console.log('📋 Table structure:');
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type}`);
      });
      return true;
    } else {
      console.log('❌ Table verification failed - no columns found');
      return false;
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('❌ Error code:', error.code);
    }
    return false;
  } finally {
    await client.end();
    console.log('📡 Database connection closed');
  }
}

// Run the function
createUserNotesTable()
  .then((success) => {
    if (success) {
      console.log('\n🎉 user_notes table setup completed successfully!');
      console.log('📝 Notes functionality is now ready for database storage');
      process.exit(0);
    } else {
      console.log('\n❌ Table setup failed');
      console.log('💡 You may need to run the SQL manually in Supabase Dashboard');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });