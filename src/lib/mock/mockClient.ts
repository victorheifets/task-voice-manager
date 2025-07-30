import { mockTasks } from './mockData';
import { v4 as uuidv4 } from 'uuid';
import { Priority } from '@/components/tasks/PrioritySelect';

// In-memory task storage
let tasks = [...mockTasks];

export async function getTasks() {
  return [...tasks].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function createTask(task: {
  title: string;
  dueDate: string | null;
  assignee: string | null;
  tags: string[];
  priority?: Priority;
}) {
  const newTask = {
    id: uuidv4(),
    ...task,
    priority: task.priority || ('medium' as Priority),
    completed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  
  tasks.push(newTask);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<{
  title: string;
  dueDate: string | null;
  assignee: string | null;
  tags: string[];
  completed: boolean;
}>) {
  const taskIndex = tasks.findIndex(task => task.id === id);
  
  if (taskIndex === -1) {
    throw new Error(`Task with ID ${id} not found`);
  }
  
  const updatedTask = {
    ...tasks[taskIndex],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  tasks[taskIndex] = updatedTask;
  return updatedTask;
}

export async function deleteTask(id: string) {
  const initialLength = tasks.length;
  tasks = tasks.filter(task => task.id !== id);
  
  if (tasks.length === initialLength) {
    throw new Error(`Task with ID ${id} not found`);
  }
  
  return true;
} 