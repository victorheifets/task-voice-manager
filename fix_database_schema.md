# Database Schema Fix Instructions

## Issue
The Task Voice Manager application is trying to create tasks with columns that don't exist in the production database:
- `assignee` column is missing
- `tags` column is missing  
- `priority` column is missing
- `due_date` column might be missing
- `completed` column might be missing

## Solution
Execute the following SQL in the Supabase SQL Editor:

### 1. Go to Supabase Dashboard
- Navigate to https://supabase.com/dashboard/project/anoupmenvlacdpqcrvzw
- Click on "SQL Editor" in the left sidebar

### 2. Run the Schema Fix SQL
Copy and paste the following SQL script:

```sql
-- Database Schema Fix for Task Voice Manager
-- Add missing columns to tasks table

-- Check if columns exist and add them if missing
DO $$ 
BEGIN
    -- Add assignee column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'assignee'
    ) THEN
        ALTER TABLE tasks ADD COLUMN assignee VARCHAR(255);
        COMMENT ON COLUMN tasks.assignee IS 'Person assigned to this task';
    END IF;
    
    -- Add tags column if it doesn't exist  
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'tags'
    ) THEN
        ALTER TABLE tasks ADD COLUMN tags TEXT[];
        COMMENT ON COLUMN tasks.tags IS 'Array of task tags/labels';
    END IF;
    
    -- Add priority column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'priority'
    ) THEN
        ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
        COMMENT ON COLUMN tasks.priority IS 'Task priority level';
    END IF;
    
    -- Add due_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'due_date'
    ) THEN
        ALTER TABLE tasks ADD COLUMN due_date TIMESTAMPTZ;
        COMMENT ON COLUMN tasks.due_date IS 'Task due date and time';
    END IF;
    
    -- Add completed column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tasks' AND column_name = 'completed'
    ) THEN
        ALTER TABLE tasks ADD COLUMN completed BOOLEAN DEFAULT FALSE;
        COMMENT ON COLUMN tasks.completed IS 'Task completion status';
    END IF;
END $$;

-- Display current schema for verification
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tasks' 
ORDER BY ordinal_position;
```

### 3. Verify the Fix
After running the script, you should see output showing all the columns in the tasks table, including the newly added ones:
- `assignee` (varchar)
- `tags` (text[])  
- `priority` (varchar with default 'medium')
- `due_date` (timestamptz)
- `completed` (boolean with default false)

### 4. Test Task Creation
Once the schema is updated, try creating a task again in the application. The error should be resolved and tasks should save successfully to the database.

## Alternative: Manual Column Addition
If the automated script doesn't work, you can add columns manually:

```sql
ALTER TABLE tasks ADD COLUMN assignee VARCHAR(255);
ALTER TABLE tasks ADD COLUMN tags TEXT[];
ALTER TABLE tasks ADD COLUMN priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));
ALTER TABLE tasks ADD COLUMN due_date TIMESTAMPTZ;
ALTER TABLE tasks ADD COLUMN completed BOOLEAN DEFAULT FALSE;
```