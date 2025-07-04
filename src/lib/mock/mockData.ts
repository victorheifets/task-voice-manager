import { Task } from '@/types/task';
import { addDays, subDays, format } from 'date-fns';

// Helper function to get ISO date string
const toISODate = (date: Date) => format(date, 'yyyy-MM-dd');

// Current date
const now = new Date();

// Generate sample tasks
export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete project proposal',
    dueDate: toISODate(addDays(now, 2)),
    assignee: 'John Doe',
    tags: ['work', 'priority'],
    completed: false,
    createdAt: subDays(now, 2).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
  },
  {
    id: '2',
    title: 'Buy groceries',
    dueDate: toISODate(now),
    assignee: null,
    tags: ['personal', 'shopping'],
    completed: false,
    createdAt: subDays(now, 3).toISOString(),
    updatedAt: subDays(now, 3).toISOString(),
  },
  {
    id: '3',
    title: 'Schedule dentist appointment',
    dueDate: toISODate(addDays(now, 7)),
    assignee: null,
    tags: ['health', 'personal'],
    completed: false,
    createdAt: subDays(now, 1).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
  },
  {
    id: '4',
    title: 'Call mom',
    dueDate: toISODate(addDays(now, 1)),
    assignee: null,
    tags: ['family'],
    completed: false,
    createdAt: subDays(now, 4).toISOString(),
    updatedAt: subDays(now, 4).toISOString(),
  },
  {
    id: '5',
    title: 'Submit expense report',
    dueDate: toISODate(subDays(now, 1)),
    assignee: 'Jane Smith',
    tags: ['work', 'finance'],
    completed: true,
    createdAt: subDays(now, 5).toISOString(),
    updatedAt: subDays(now, 2).toISOString(),
  },
  {
    id: '6',
    title: 'Prepare presentation for meeting',
    dueDate: toISODate(addDays(now, 3)),
    assignee: 'John Doe',
    tags: ['work', 'meeting'],
    completed: false,
    createdAt: subDays(now, 2).toISOString(),
    updatedAt: subDays(now, 2).toISOString(),
  },
  {
    id: '7',
    title: 'Book flight tickets',
    dueDate: toISODate(addDays(now, 14)),
    assignee: null,
    tags: ['travel', 'personal'],
    completed: false,
    createdAt: subDays(now, 1).toISOString(),
    updatedAt: subDays(now, 1).toISOString(),
  },
]; 