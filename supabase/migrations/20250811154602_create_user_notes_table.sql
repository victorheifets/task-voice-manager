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