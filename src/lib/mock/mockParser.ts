import { ParsedTaskData } from '@/types/task';
import { v4 as uuidv4 } from 'uuid';
import { format, addDays } from 'date-fns';

/**
 * Mock function to parse task input text
 * In a real application, this would be replaced with more sophisticated NLP
 */
export function parseTaskInput(text: string): ParsedTaskData {
  const lowercaseText = text.toLowerCase();
  let dueDate = null;
  let assignee = null;
  const tags: string[] = [];
  
  // Extract due date (very simple parsing)
  if (lowercaseText.includes('today')) {
    dueDate = format(new Date(), 'yyyy-MM-dd');
  } else if (lowercaseText.includes('tomorrow')) {
    dueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  } else if (lowercaseText.includes('next week')) {
    dueDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  }
  
  // Extract assignee (very simple parsing)
  const assigneeMatch = lowercaseText.match(/(?:assign to|for) (\w+)/i);
  if (assigneeMatch && assigneeMatch[1]) {
    assignee = assigneeMatch[1].charAt(0).toUpperCase() + assigneeMatch[1].slice(1);
  }
  
  // Extract tags (very simple parsing)
  const tagMatches = lowercaseText.match(/#(\w+)/g);
  if (tagMatches) {
    tagMatches.forEach(tag => {
      tags.push(tag.substring(1));
    });
  }
  
  // Add some default tags based on content
  if (lowercaseText.includes('call') || lowercaseText.includes('phone')) {
    tags.push('call');
  }
  if (lowercaseText.includes('meeting') || lowercaseText.includes('discuss')) {
    tags.push('meeting');
  }
  if (lowercaseText.includes('email') || lowercaseText.includes('send')) {
    tags.push('email');
  }
  
  return {
    title: text,
    dueDate,
    assignee,
    tags: [...new Set(tags)] // Remove duplicates
  };
} 