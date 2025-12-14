import { createBrowserClient } from '@supabase/ssr'
import { Task } from '@/types/task'
import { sampleTasks } from '@/data/sampleTasks'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Check if Supabase is properly configured
// Force demo mode only if URL/key is empty or using demo domain
const FORCE_DEMO_MODE = !supabaseUrl ||
                        !supabaseAnonKey ||
                        supabaseUrl.includes('demo.supabase.co')

// Demo mode state - will be true when Supabase is unavailable
let isDemoMode = FORCE_DEMO_MODE
let demoModeChecked = FORCE_DEMO_MODE // Skip connection check if already in demo mode

// Create a minimal mock client for demo mode to prevent network errors
const createMockClient = () => ({
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: (callback: (event: string, session: null) => void) => {
      // Call immediately with null session to indicate no user
      if (typeof window !== 'undefined') {
        setTimeout(() => callback('SIGNED_OUT', null), 0)
      }
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Demo mode - authentication disabled' } }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null, single: () => ({ data: null, error: null }) }) }),
    insert: () => ({ data: null, error: { message: 'Demo mode' }, select: () => ({ single: () => ({ data: null, error: { message: 'Demo mode' } }) }) }),
    update: () => ({ data: null, error: { message: 'Demo mode' }, eq: () => ({ eq: () => ({ select: () => ({ single: () => ({ data: null, error: { message: 'Demo mode' } }) }) }) }) }),
    delete: () => ({ error: { message: 'Demo mode' }, eq: () => ({ eq: () => ({ error: { message: 'Demo mode' } }) }) }),
    upsert: () => ({ error: { message: 'Demo mode' } }),
  }),
})

// Create Supabase client - use mock if in demo mode to prevent network errors
export const supabase = FORCE_DEMO_MODE
  ? createMockClient() as any
  : createBrowserClient(supabaseUrl, supabaseAnonKey)

// Check if we're in demo mode
export function isInDemoMode(): boolean {
  return isDemoMode
}

// Local storage helpers for demo mode
const DEMO_TASKS_KEY = 'demo_tasks'
const DEMO_NOTES_KEY = 'demo_notes'

function getDemoTasks(): Task[] {
  if (typeof window === 'undefined') return sampleTasks
  const stored = localStorage.getItem(DEMO_TASKS_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return sampleTasks
    }
  }
  // Initialize with sample tasks
  localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(sampleTasks))
  return sampleTasks
}

function saveDemoTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_TASKS_KEY, JSON.stringify(tasks))
}

function getDemoNotes(): {[key: number]: string} {
  if (typeof window === 'undefined') return {}
  const stored = localStorage.getItem(DEMO_NOTES_KEY)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch {
      return {}
    }
  }
  return {}
}

function saveDemoNotes(notes: {[key: number]: string}): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DEMO_NOTES_KEY, JSON.stringify(notes))
}

// Test Supabase connectivity
async function checkSupabaseConnection(): Promise<boolean> {
  try {
    // Try a lightweight health check
    const { error } = await supabase.auth.getSession()
    if (error && error.message?.includes('fetch')) {
      return false
    }
    return true
  } catch (_e) {
    return false
  }
}

// Task management functions
export async function getTasks(): Promise<Task[]> {
  // Check connection on first call
  if (!demoModeChecked) {
    demoModeChecked = true
    const connected = await checkSupabaseConnection()
    if (!connected) {
      console.warn('📴 Supabase unavailable - switching to demo mode with sample data')
      isDemoMode = true
    }
  }

  // Demo mode - use local storage
  if (isDemoMode) {
    return getDemoTasks()
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Not authenticated - use demo mode
    console.warn('📴 User not authenticated - switching to demo mode')
    isDemoMode = true
    return getDemoTasks()
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error loading tasks:', error);
    throw error;
  }
  
  
  // Map database fields to Task interface
  // DB uses: assigned_to, status (not assignee, completed)
  const mappedTasks = (data || []).map((dbTask: any) => {
    return {
      id: dbTask.id,
      title: dbTask.title,
      dueDate: dbTask.due_date || null,
      assignee: dbTask.assigned_to || null,  // Database column is 'assigned_to'
      tags: dbTask.tags || [],
      completed: dbTask.status === 'completed',  // Database uses 'status' column
      createdAt: dbTask.created_at,
      updatedAt: dbTask.updated_at,
      priority: dbTask.priority || 'medium',
      notes: dbTask.description || null  // DB might use 'description' for notes
    };
  });
  
  return mappedTasks;
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  // Demo mode - use local storage
  if (isDemoMode) {
    const tasks = getDemoTasks()
    const newTask: Task = {
      id: `demo-${Date.now()}`,
      title: task.title,
      dueDate: task.dueDate || null,
      assignee: task.assignee || null,
      tags: task.tags || [],
      completed: task.completed || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      priority: task.priority || 'medium',
      notes: task.notes || undefined
    }
    tasks.unshift(newTask)
    saveDemoTasks(tasks)
    return newTask
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    // Not authenticated - use demo mode
    isDemoMode = true
    return createTask(task) // Recursive call in demo mode
  }
  

  // Create base task data with all columns
  // Actual DB schema uses: assigned_to, status, tags, priority
  const taskData: any = {
    title: task.title,
    user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: task.completed ? 'completed' : 'pending'
  }

  // Add optional columns if they have values
  if (task.dueDate) taskData.due_date = task.dueDate
  if (task.assignee) taskData.assigned_to = task.assignee  // Database column is 'assigned_to'
  if (task.tags && task.tags.length > 0) taskData.tags = task.tags
  if (task.priority) taskData.priority = task.priority

  console.log('📝 Creating task with data:', JSON.stringify(taskData, null, 2));

  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single()

  if (error) {
    console.error('❌ Database insert error:', error);
    throw error;
  }

  // Return task with safe property access
  // DB uses: assigned_to, status (not assignee, completed)
  const createdTask = {
    id: data.id,
    title: data.title,
    dueDate: data.due_date || null,
    assignee: data.assigned_to || null,  // Database column is 'assigned_to'
    tags: data.tags || [],
    completed: data.status === 'completed',  // Database uses 'status' column
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    priority: data.priority || 'medium'
  };

  return createdTask;
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  // Demo mode - use local storage
  if (isDemoMode ) {
    isDemoMode = true
    const tasks = getDemoTasks()
    const taskIndex = tasks.findIndex(t => t.id === taskId)
    if (taskIndex === -1) {
      throw new Error(`Task ${taskId} not found`)
    }
    const updatedTask = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    tasks[taskIndex] = updatedTask
    saveDemoTasks(tasks)
    return updatedTask
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    isDemoMode = true
    return updateTask(taskId, updates) // Recursive call in demo mode
  }

  // Build update data with only core columns
  // DB uses: assigned_to, status (not assignee, completed)
  const updateData: any = {
    updated_at: new Date().toISOString()
  }

  // Only update columns that exist in the database
  if (updates.title !== undefined) updateData.title = updates.title
  // Handle dueDate - allow null to clear the date
  if ('dueDate' in updates) updateData.due_date = updates.dueDate
  if (updates.completed !== undefined) updateData.status = updates.completed ? 'completed' : 'pending'  // Database uses 'status'
  if (updates.notes !== undefined) updateData.description = updates.notes  // DB uses 'description'
  if (updates.assignee !== undefined) updateData.assigned_to = updates.assignee  // Database column is 'assigned_to'
  if (updates.priority !== undefined) updateData.priority = updates.priority
  if (updates.tags !== undefined) updateData.tags = updates.tags
  

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
  // DB uses: assigned_to, status (not assignee, completed)
  return {
    id: data.id,
    title: data.title,
    dueDate: data.due_date || null,
    assignee: data.assigned_to || null,  // Database column is 'assigned_to'
    tags: data.tags || [],
    completed: data.status === 'completed',  // Database uses 'status' column
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    priority: data.priority || 'medium',
    notes: data.description || null  // DB uses 'description'
  }
}

export async function deleteTask(id: string): Promise<void> {
  // Demo mode - use local storage
  if (isDemoMode ) {
    isDemoMode = true
    const tasks = getDemoTasks()
    const filteredTasks = tasks.filter(t => t.id !== id)
    saveDemoTasks(filteredTasks)
    return
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    isDemoMode = true
    return deleteTask(id) // Recursive call in demo mode
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw error
}

// Usage tracking functions
export async function trackAPIUsage(tokensUsed: number): Promise<void> {
  // Demo mode - skip usage tracking
  if (isDemoMode ) {
    return
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return // Skip in demo mode

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
  } catch (e) {
    console.warn('Usage tracking failed (demo mode):', e)
  }
}

export async function getUserUsage() {
  // Demo mode - return default usage
  if (isDemoMode ) {
    return { api_calls: 0, tokens_used: 0 }
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { api_calls: 0, tokens_used: 0 }

    const currentMonth = new Date().toISOString().substring(0, 7)

    const { data, error } = await supabase
      .from('user_usage')
      .select('api_calls, tokens_used')
      .eq('user_id', user.id)
      .eq('month', currentMonth)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data || { api_calls: 0, tokens_used: 0 }
  } catch (e) {
    console.warn('Usage fetch failed (demo mode):', e)
    return { api_calls: 0, tokens_used: 0 }
  }
}

// Notes management functions
export async function getUserNotes(): Promise<{notes: {[key: number]: string}, error?: string}> {
  // Demo mode - use local storage
  if (isDemoMode ) {
    isDemoMode = true
    return { notes: getDemoNotes() }
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      isDemoMode = true
      return { notes: getDemoNotes() }
    }

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
          notes: getDemoNotes(),
          error: `Notes table not found in database. Using local storage instead.`
        };
      } else if (error.code === 'PGRST116') {
        // No rows found (not an error)
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
          notes: getDemoNotes(),
          error: `Notes could not be loaded from database: ${errorMessage}. Using local storage instead.`
        };
      }
    }


    // Convert to tab_id -> content mapping
    // Each tab will be stored as a separate record with title like "Tab 0", "Tab 1", etc.
    const notesMap: {[key: number]: string} = {};
    if (data) {
      data.forEach((note: any) => {
        // Extract tab number from title (e.g., "Tab 0" -> 0)
        const tabMatch = note.title.match(/^Tab (\d+)$/);
        if (tabMatch) {
          const tabId = parseInt(tabMatch[1]);
          notesMap[tabId] = note.content;
        }
      });
    }

    return { notes: notesMap };
  } catch (e) {
    console.warn('Notes fetch failed (demo mode):', e)
    isDemoMode = true
    return { notes: getDemoNotes() }
  }
}

export async function saveUserNote(tabId: number, content: string): Promise<void> {
  // Demo mode - use local storage
  if (isDemoMode ) {
    isDemoMode = true
    const notes = getDemoNotes()
    notes[tabId] = content
    saveDemoNotes(notes)
    return
  }

  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      // Switch to demo mode
      isDemoMode = true
      const notes = getDemoNotes()
      notes[tabId] = content
      saveDemoNotes(notes)
      return
    }

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
      console.warn('⚠️ Note save failed, using local storage fallback');
      // Fall back to local storage
      const notes = getDemoNotes()
      notes[tabId] = content
      saveDemoNotes(notes)
      return;
    }
  } catch (e) {
    console.warn('Note save failed (demo mode):', e)
    // Fall back to local storage
    const notes = getDemoNotes()
    notes[tabId] = content
    saveDemoNotes(notes)
  }
}