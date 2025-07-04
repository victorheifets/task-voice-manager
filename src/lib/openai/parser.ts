import OpenAI from 'openai';
import { ParsedTaskData } from '@/types/task';
import { addDays, format, nextFriday, startOfWeek } from 'date-fns';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true, // Allow browser usage (not recommended for production)
});

// Function to split text into potential tasks
function splitIntoTasks(text: string): string[] {
  // Split by common task separators:
  // 1. Newlines
  // 2. Sentences ending with period followed by capitalized word
  // 3. Common conjunctions like "And", "Also", "Then" at the beginning of sentences
  
  // First, split by newlines
  let tasks = text.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  // If we only have one item, try to split by periods followed by space and capital letter
  if (tasks.length === 1) {
    const sentenceSplitRegex = /(?<=\.\s+)(?=[A-Z])/;
    tasks = tasks[0].split(sentenceSplitRegex)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0);
  }
  
  // Further split sentences that start with task indicators
  const result: string[] = [];
  for (const task of tasks) {
    // Check if the task contains conjunctions like "And", "Also", "Then" that might indicate separate tasks
    const conjunctionRegex = /\s+(And|Also|Then|Next|Additionally|Moreover|Furthermore)\s+(?=[A-Z])/g;
    const subtasks = task.split(conjunctionRegex)
      .map(t => t.trim())
      .filter(t => t.length > 0);
    
    if (subtasks.length > 1) {
      result.push(...subtasks);
    } else {
      result.push(task);
    }
  }
  
  return result.filter(task => task.length > 5); // Filter out very short fragments
}

// Parse a single task
export async function parseTaskText(text: string): Promise<ParsedTaskData> {
  try {
    // Use OpenAI to parse the task text
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // Updated to a model that supports JSON response format
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: 'system',
          content: `You are a task parsing assistant that extracts structured information from natural language task descriptions. Your goal is to accurately identify key components of a task.

TASK COMPONENTS TO EXTRACT:
1. Title: The complete original task description
2. Due Date: When the task needs to be completed (in YYYY-MM-DD format)
3. Assignee: The person responsible for the task
4. Tags: Keywords or categories related to the task

DATE PARSING RULES:
- Today = ${format(new Date(), 'yyyy-MM-dd')}
- Tomorrow = ${format(addDays(new Date(), 1), 'yyyy-MM-dd')}
- This week = Any day until ${format(nextFriday(new Date()), 'yyyy-MM-dd')}
- Next week = The week after this week
- End of month = Last day of the current month
- Next month = Last day of next month
- Specific dates like "March 15" or "3/15" should be interpreted for the nearest future occurrence
- If a day of week is mentioned ("Monday", "Tuesday", etc.), use the next occurrence of that day
- Friday refers to ${format(nextFriday(new Date()), 'yyyy-MM-dd')}

ASSIGNEE EXTRACTION RULES:
- Look for phrases like "assign to [Name]", "with [Name]", "@[Name]", "to [Name]"
- Names are typically capitalized
- If multiple people are mentioned, the first one after "with", "to", or "assign" is likely the assignee

TAG EXTRACTION RULES:
- Extract hashtags (#project, #urgent)
- Extract keywords after "about", "regarding", "for" that look like project names or categories
- Extract common task categories: "meeting", "call", "email", "report", "presentation"
- Extract company names, product names, or department names
- Convert all tags to lowercase for consistency

Return only valid JSON with the following structure:
{
  "title": string,
  "dueDate": string | null,
  "assignee": string | null,
  "tags": string[]
}`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    const responseContent = response.choices[0].message.content || '{}';
    console.log('Raw OpenAI response for single task:', responseContent);
    
    let result;
    try {
      result = JSON.parse(responseContent);
      console.log('OpenAI parsed result:', result);
    } catch (error) {
      console.error('Error parsing JSON response for single task:', error);
      console.error('Raw response content:', responseContent);
      result = {};
    }
    
    return {
      title: result?.title || text,
      dueDate: result?.dueDate || null,
      assignee: result?.assignee || null,
      tags: Array.isArray(result?.tags) ? result.tags : []
    };
  } catch (error) {
    console.error('Error parsing task with OpenAI:', error);
    
    // Fallback parsing in case OpenAI fails
    return fallbackParsing(text);
  }
}

// Parse multiple tasks directly with one API call
export async function parseMultipleTasks(text: string): Promise<ParsedTaskData[]> {
  try {
    // Use OpenAI to parse multiple tasks at once
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      response_format: { type: "json_object" }, // Use json_object which is supported by the API
      messages: [
        {
          role: 'system',
          content: `You are a task parsing assistant that extracts structured information from natural language task descriptions.

Split the input into multiple tasks if more than one is found.

TASK COMPONENTS TO EXTRACT:
1. Title: The complete original task description
2. Due Date: When the task needs to be completed (in YYYY-MM-DD format)
3. Assignee: The person responsible for the task
4. Tags: Keywords or categories related to the task

DATE PARSING RULES:
- Today = ${format(new Date(), 'yyyy-MM-dd')}
- Tomorrow = ${format(addDays(new Date(), 1), 'yyyy-MM-dd')}
- This week = Any day until ${format(nextFriday(new Date()), 'yyyy-MM-dd')}
- Next week = The week after this week
- End of month = Last day of the current month
- Next month = Last day of next month
- Specific dates like "March 15" or "3/15" refer to the nearest future occurrence
- If a day of week is mentioned ("Monday", etc.), use the next occurrence
- Friday refers to ${format(nextFriday(new Date()), 'yyyy-MM-dd')}

ASSIGNEE EXTRACTION RULES:
- Look for "assign to [Name]", "with [Name]", "@[Name]", "to [Name]"
- Names are capitalized
- If multiple names appear, first one after those markers is the assignee

TAG EXTRACTION RULES:
- Extract hashtags (#project, #urgent)
- Extract keywords after "about", "regarding", "for"
- Extract categories: "meeting", "call", "email", "report", "presentation"
- Extract company/product/department names
- Convert all tags to lowercase

Return only valid JSON with the following structure:
{
  "tasks": [
    {
      "title": string,
      "dueDate": string | null,
      "assignee": string | null,
      "tags": string[]
    }
  ]
}`
        },
        {
          role: 'user',
          content: text
        }
      ]
    });

    const responseContent = response.choices[0].message.content || '{"tasks":[]}';
    console.log('Raw OpenAI response:', responseContent);
    
    let result;
    try {
      result = JSON.parse(responseContent);
      console.log('OpenAI parsed multiple tasks:', result);
    } catch (error) {
      console.error('Error parsing JSON response:', error);
      console.error('Raw response content:', responseContent);
      result = { tasks: [] };
    }
    
    if (result && result.tasks && Array.isArray(result.tasks)) {
      return result.tasks.map((task: { title?: string; dueDate?: string | null; assignee?: string | null; tags?: string[] }) => ({
        title: task.title || '',
        dueDate: task.dueDate || null,
        assignee: task.assignee || null,
        tags: Array.isArray(task.tags) ? task.tags : []
      }));
    } else {
      // If the result is not properly formatted, return a single task
      console.warn('Response format was not as expected, falling back to single task');
      return [{
        title: text,
        dueDate: null,
        assignee: null,
        tags: []
      }];
    }
  } catch (error) {
    console.error('Error parsing multiple tasks with OpenAI:', error);
    
    // Fall back to splitting the text and parsing each task individually
    const taskTexts = splitIntoTasks(text);
    const results: ParsedTaskData[] = [];
    
    for (const taskText of taskTexts) {
      try {
        const parsedTask = await parseTaskText(taskText);
        results.push(parsedTask);
      } catch (error) {
        console.error(`Error parsing task "${taskText}":`, error);
        // Add a basic fallback for failed tasks
        results.push({
          title: taskText,
          dueDate: null,
          assignee: null,
          tags: []
        });
      }
    }
    
    return results;
  }
}

// Fallback parsing using regex
function fallbackParsing(text: string): ParsedTaskData {
  // Simple parsing logic as fallback
  const title = text;
  let dueDate: string | null = null;
  let assignee: string | null = null;
  const tags: string[] = [];
  
  // Extract hashtags
  const hashtagRegex = /#(\w+)/g;
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    tags.push(match[1]);
  }
  
  // Extract keywords that might be tags (after "about")
  const aboutRegex = /about\s+(\w+)/i;
  const aboutMatch = text.match(aboutRegex);
  if (aboutMatch && aboutMatch[1]) {
    const potentialTag = aboutMatch[1];
    // Only add if it looks like a tag (all caps or camelCase)
    if (potentialTag === potentialTag.toUpperCase() || 
        (potentialTag !== potentialTag.toLowerCase() && potentialTag[0] === potentialTag[0].toUpperCase())) {
      tags.push(potentialTag);
    }
  }
  
  // Simple date extraction
  if (text.toLowerCase().includes('tomorrow')) {
    dueDate = format(addDays(new Date(), 1), 'yyyy-MM-dd');
  } else if (text.toLowerCase().includes('today')) {
    dueDate = format(new Date(), 'yyyy-MM-dd');
  } else if (text.toLowerCase().includes('next week')) {
    dueDate = format(addDays(new Date(), 7), 'yyyy-MM-dd');
  } else if (text.toLowerCase().includes('end of week') || text.toLowerCase().includes('by end of week')) {
    dueDate = format(nextFriday(new Date()), 'yyyy-MM-dd');
  }
  
  // Simple assignee extraction
  // Look for "with [Name]" pattern
  const withRegex = /with\s+(\w+)/i;
  const withMatch = text.match(withRegex);
  if (withMatch && withMatch[1]) {
    assignee = withMatch[1];
  } else {
    // Look for "@[Name]" pattern as fallback
    const assignRegex = /@(\w+)/;
    const assignMatch = text.match(assignRegex);
    if (assignMatch) {
      assignee = assignMatch[1];
    }
  }
  
  return {
    title,
    dueDate,
    assignee,
    tags
  };
} 