import { v4 as uuidv4 } from 'uuid';
import { Task } from '@/types/task';
import { Priority } from '@/components/tasks/PrioritySelect';

// Mock data
let tasks: Task[] = [
  {
    id: '1',
    title: 'Complete project documentation',
    dueDate: '2024-03-20',
    assignee: 'John Doe',
    tags: ['documentation', 'urgent'],
    completed: false,
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Review pull requests',
    dueDate: '2024-03-19',
    assignee: null,
    tags: ['code-review'],
    completed: false,
    createdAt: '2024-03-15T11:00:00Z',
    updatedAt: '2024-03-15T11:00:00Z',
    priority: 'medium'
  }
];

export const supabase = {
  // Mock implementation
};

export async function getTasks(): Promise<Task[]> {
  return tasks;
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
  const newTask: Task = {
    ...task,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  tasks.push(newTask);
  return newTask;
}

export async function updateTask(taskId: string, updates: Partial<Task>) {
  const taskIndex = tasks.findIndex(task => task.id === taskId);
  
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${taskId} not found`);
  }
  
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  return tasks[taskIndex];
}

export async function deleteTask(id: string): Promise<void> {
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${id} not found`);
  }
  
  tasks = tasks.filter(task => task.id !== id);
} 