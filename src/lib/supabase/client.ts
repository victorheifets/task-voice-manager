import { createBrowserClient } from '@supabase/ssr'
import { Task } from '@/types/task'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey)

// Task management functions
export async function getTasks(): Promise<Task[]> {
  // Development mode: use localStorage
  if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.location.search.includes('skipauth'))) {
    const tasks = localStorage.getItem('dev_tasks')
    return tasks ? JSON.parse(tasks) : []
  }

  // If running on server, return empty array
  if (typeof window === 'undefined') {
    return []
  }

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
  // Development mode: use localStorage
  if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.location.search.includes('skipauth'))) {
    const tasks = JSON.parse(localStorage.getItem('dev_tasks') || '[]')
    const newTask: Task = {
      ...task,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    tasks.unshift(newTask)
    localStorage.setItem('dev_tasks', JSON.stringify(tasks))
    return newTask
  }

  // If running on server, throw error
  if (typeof window === 'undefined') {
    throw new Error('Cannot create task on server')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      ...task,
      user_id: user.id,
      due_date: task.dueDate,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    title: data.title,
    dueDate: data.due_date,
    assignee: data.assignee,
    tags: data.tags,
    completed: data.completed,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    priority: data.priority
  }
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  // Development mode: use localStorage
  if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.location.search.includes('skipauth'))) {
    const tasks = JSON.parse(localStorage.getItem('dev_tasks') || '[]')
    const taskIndex = tasks.findIndex((t: Task) => t.id === taskId)
    if (taskIndex === -1) throw new Error('Task not found')
    
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    localStorage.setItem('dev_tasks', JSON.stringify(tasks))
    return tasks[taskIndex]
  }

  // If running on server, throw error
  if (typeof window === 'undefined') {
    throw new Error('Cannot update task on server')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('User not authenticated')

  const updateData: any = {
    ...updates,
    updated_at: new Date().toISOString()
  }

  if (updates.dueDate !== undefined) {
    updateData.due_date = updates.dueDate
    delete updateData.dueDate
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', taskId)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) throw error

  return {
    id: data.id,
    title: data.title,
    dueDate: data.due_date,
    assignee: data.assignee,
    tags: data.tags,
    completed: data.completed,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    priority: data.priority
  }
}

export async function deleteTask(id: string): Promise<void> {
  // Development mode: use localStorage
  if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.location.search.includes('skipauth'))) {
    const tasks = JSON.parse(localStorage.getItem('dev_tasks') || '[]')
    const filteredTasks = tasks.filter((t: Task) => t.id !== id)
    localStorage.setItem('dev_tasks', JSON.stringify(filteredTasks))
    return
  }

  // If running on server, throw error
  if (typeof window === 'undefined') {
    throw new Error('Cannot delete task on server')
  }

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