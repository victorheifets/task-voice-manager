import { createBrowserClient } from '@supabase/ssr'
import { Task } from '@/types/task'
import { sampleTasks } from '@/data/sampleTasks'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Task management functions
export async function getTasks(): Promise<Task[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  // Create base task data with only core columns that exist in database
  const taskData: any = {
    title: task.title,
    user_id: user.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  // Add optional columns only if they exist in the schema (graceful handling)
  if (task.dueDate) taskData.due_date = task.dueDate
  
  const { data, error } = await supabase
    .from('tasks')
    .insert(taskData)
    .select()
    .single()

  if (error) throw error

  // Return task with safe property access
  return {
    id: data.id,
    title: data.title,
    dueDate: data.due_date || null,
    assignee: data.assignee || task.assignee || null,
    tags: data.tags || task.tags || [],
    completed: data.completed || false,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    priority: data.priority || task.priority || 'medium'
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
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

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

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
    priority: data.priority || updates.priority || 'medium'
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