# Setup Supabase user_notes Table

Since programmatic table creation isn't working, please follow these steps:

## Step 1: Access Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Open your project: **task-voice-manager** (anoupmenvlacdpqcrvzw)
3. Navigate to **SQL Editor**

## Step 2: Execute This SQL
Copy and paste the following SQL into the SQL Editor and click **RUN**:

```sql
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
CREATE POLICY "Users can view their own notes" ON user_notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own notes" ON user_notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON user_notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON user_notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_notes_user_id ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notes_tab_id ON user_notes(user_id, tab_id);
```

## Step 3: Verify Table Creation
After running the SQL, you should see:
- ✅ Table `user_notes` created
- ✅ RLS policies enabled
- ✅ Indexes created

## Step 4: Test Access
Run this in your terminal to verify:
```bash
node test-table-creation.js
```

You should see: **✅ Table user_notes exists and is accessible!**