import { Priority } from '@/components/tasks/PrioritySelect';

export interface Task {
  id: string;
  title: string;
  dueDate: string | null;
  assignee: string | null;
  tags: string[];
  completed: boolean;
  createdAt: string;
  updatedAt: string | null;
  priority: Priority;
  notes?: string;
}

export type TaskFilter = 
  | 'all'
  | 'today'
  | 'tomorrow'
  | 'thisWeek'
  | 'nextWeek'
  | 'overdue'
  | 'completed';

export interface TaskInput {
  text: string;
}

export interface ParsedTaskData {
  title: string;
  dueDate: string | null;
  assignee: string | null;
  tags: string[];
} 