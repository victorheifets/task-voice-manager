import { createBrowserClient } from '@supabase/ssr'
import { Task } from '@/types/task'
import { sampleTasks } from '@/data/sampleTasks'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Task management functions
export async function getTasks(): Promise<Task[]> {
  console.log('📋 Loading tasks from database...');
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error loading tasks:', error);
    throw error;
  }
  
  console.log('📥 Raw database tasks:', data);
  console.log('🔍 First task detailed:', data?.[0] ? JSON.stringify(data[0], null, 2) : 'No tasks');
  
  // Map database fields to Task interface
  const mappedTasks = (data || []).map(dbTask => {
    console.log('🔄 Mapping task:', dbTask.id, 'Title:', dbTask.title);
    return {
      id: dbTask.id,
      title: dbTask.title,
      dueDate: dbTask.due_date || null,
      assignee: dbTask.assigned_to || dbTask.assignee || null, // Handle both database column names
      tags: dbTask.tags || [],
      completed: dbTask.completed || false,
      createdAt: dbTask.created_at,
      updatedAt: dbTask.updated_at,
      priority: dbTask.priority || 'medium',
      notes: dbTask.notes || null
    };
  });
  
  console.log('📤 Mapped tasks for UI:', mappedTasks);
  console.log('🔍 First mapped task detailed:', mappedTasks?.[0] ? JSON.stringify(mappedTasks[0], null, 2) : 'No mapped tasks');
  return mappedTasks;
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  console.log('🔐 Checking authentication...');
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')
  
  console.log('✅ User authenticated:', user.id);

  // Create base task data with only core columns that exist in database
  const taskData: any = {
    title: task.title,
    user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Add optional columns only if they exist in the schema (graceful handling)
  if (task.dueDate) taskData.due_date = task.dueDate
  
  console.log('📝 Inserting task data:', taskData);
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single()

  if (error) {
    console.error('❌ Database insert error:', error);
    throw error;
  }
  
  console.log('✅ Database insert successful:', data);

  // Return task with safe property access
  const createdTask = {
    id: data.id,
    title: data.title,
    dueDate: data.due_date || null,
    assignee: data.assignee || task.assignee || null,
    tags: data.tags || task.tags || [],
    completed: data.completed || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    priority: data.priority || task.priority || 'medium'
  };
  
  console.log('📤 Returning created task:', createdTask);
  return createdTask;
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  console.log('🔄 updateTask called with:', { taskId, updates });
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Build update data with only core columns
  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  // Only update columns that exist in the database
  if (updates.title !== undefined) updateData.title = updates.title
  if (updates.dueDate !== undefined) updateData.due_date = updates.dueDate
  if (updates.completed !== undefined) updateData.completed = updates.completed
  if (updates.notes !== undefined) updateData.notes = updates.notes
  if (updates.assignee !== undefined) {
    updateData.assigned_to = updates.assignee  // Database column is 'assigned_to', not 'assignee'
  }
  if (updates.priority !== undefined) updateData.priority = updates.priority
  if (updates.tags !== undefined) updateData.tags = updates.tags
  
  console.log('📤 Sending to database:', updateData);

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Database error updating task:', error)
    throw new Error(`Failed to update task: ${error.message || JSON.stringify(error)}`)
  }

  // Return with safe property access
  return {
    id: data.id,
    title: data.title,
    dueDate: data.due_date || null,
    assignee: data.assignee || updates.assignee || null,
    tags: data.tags || updates.tags || [],
    completed: data.completed || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    priority: data.priority || updates.priority || 'medium',
    notes: data.notes || updates.notes || null
  }
}

export async function deleteTask(id: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}

// Usage tracking functions
export async function trackAPIUsage(tokensUsed: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const currentMonth = new Date().toISOString().substring(0, 7)

  const { data: usage } = await supabase
    .from('user_usage')
    .select('api_calls, tokens_used')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .single()

  if (usage) {
    // Update existing usage
    await supabase
      .from('user_usage')
      .update({
        api_calls: usage.api_calls + 1,
        tokens_used: usage.tokens_used + tokensUsed
      })
      .eq('user_id', user.id)
      .eq('month', currentMonth)
  } else {
    // Create new usage record
    await supabase
      .from('user_usage')
      .insert({
        user_id: user.id,
        month: currentMonth,
        api_calls: 1,
        tokens_used: tokensUsed
      })
  }
}

export async function getUserUsage() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const currentMonth = new Date().toISOString().substring(0, 7)

  const { data, error } = await supabase
    .from('user_usage')
    .select('api_calls, tokens_used')
    .eq('user_id', user.id)
    .eq('month', currentMonth)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data || { api_calls: 0, tokens_used: 0 }
}

// Notes management functions
export async function getUserNotes(): Promise<{notes: {[key: number]: string}, error?: string}> {
  console.log('📋 Loading user notes from database...');
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('user_notes')
    .select('*')
    .eq('user_id', user.id)

  if (error) {
    console.error('❌ Error loading notes:', error);
    // Handle specific Supabase errors
    if (error.code === '42P01') {
      // Table doesn't exist
      console.warn('📝 Notes table does not exist yet, using local storage fallback');
      return { 
        notes: {}, 
        error: `Notes table not found in database. Using local storage instead.`
      };
    } else if (error.code === 'PGRST116') {
      // No rows found (not an error)
      console.log('📝 No notes found in database (new user)');
      return { notes: {} };
    } else {
      const errorMessage = error.message || error.details || 'Unknown database error';
      console.error('💥 Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return { 
        notes: {}, 
        error: `Notes could not be loaded from database: ${errorMessage}. Using local storage instead.`
      };
    }
  }
  
  console.log('📥 Raw database notes:', data);
  
  // Convert to tab_id -> content mapping
  // Each tab will be stored as a separate record with title like "Tab 0", "Tab 1", etc.
  const notesMap: {[key: number]: string} = {};
  if (data) {
    data.forEach(note => {
      // Extract tab number from title (e.g., "Tab 0" -> 0)
      const tabMatch = note.title.match(/^Tab (\d+)$/);
      if (tabMatch) {
        const tabId = parseInt(tabMatch[1]);
        notesMap[tabId] = note.content;
      }
    });
  }
  
  console.log('📤 Mapped notes for UI:', notesMap);
  return { notes: notesMap };
}

export async function saveUserNote(tabId: number, content: string): Promise<void> {
  console.log('💾 Saving note to database for tab:', tabId, 'Content length:', content.length);
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { error } = await supabase
    .from('user_notes')
    .upsert({
      user_id: user.id,
      title: `Tab ${tabId}`,
      content: content,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,title'  // Use user_id and title as unique constraint
    })

  if (error) {
    console.error('❌ Error saving note:', error);
    console.warn('⚠️ Note save failed, continuing without saving notes');
    // Don't throw - just log and continue to prevent app crashes
    return;
  }
  
  console.log('✅ Note saved to database successfully');
}