# Task Voice Manager - Project Summary

## Overview
Task Voice Manager is a Progressive Web App (PWA) that allows users to create and manage tasks using both voice and text input. The app uses AI to process natural language input and extract structured task data, including due dates, assignees, and tags. It supports multiple languages, provides smart filtering and sorting capabilities, and works on both desktop and mobile devices.

## Key Features
- **Voice Input**: Record tasks using your voice in English, Hebrew, or Russian
- **Text Input**: Type tasks with natural language processing
- **AI Processing**: Automatically extracts task details, due dates, assignees, and tags
- **Smart Filtering**: Filter tasks by due date (today, tomorrow, this week, etc.)
- **Sorting & Searching**: Sort by any field and search across all task data
- **Responsive Design**: Works on both desktop and mobile devices
- **Offline Support**: PWA capabilities for offline access
- **Multi-language Support**: Voice recognition in multiple languages

## AI Integration
The core of the application is the AI-powered task parsing:

1. **Input Processing**: When a user enters a task (via text or voice), the raw input is sent to OpenAI's GPT-4
2. **Structured Data Extraction**: The AI analyzes the text and extracts:
   - The original task description
   - Due date (with intelligent date parsing for phrases like "end of week", "tomorrow", etc.)
   - Assignee (person responsible for the task)
   - Tags (keywords or categories)
3. **Confirmation**: The extracted data is shown to the user for confirmation
4. **Storage**: Once confirmed, the structured data is saved to the database

Example:
- Input: "talk with Gadu about CF by end of week"
- AI extracts:
  - Task: "talk with Gadu about CF by end of week"
  - Assignee: "Gadu"
  - Due date: Friday of the current week (in YYYY-MM-DD format)
  - Tags: ["CF"]

## Technical Implementation

### Frontend
- **Framework**: Next.js with TypeScript
- **UI Library**: Material-UI (MUI)
- **State Management**: React hooks
- **PWA Features**: Service worker, manifest, offline support

### Voice Processing
- **Web Speech API**: For in-browser voice recognition
- **OpenAI Whisper API**: Server-side fallback for more accurate transcription

### Task Parsing
- **OpenAI GPT-4**: For intelligent parsing of natural language into structured task data
- **Date Recognition**: Automatically detects and formats dates from text
- **Person Extraction**: Identifies assignees from context
- **Tag Identification**: Extracts keywords that represent categories

### Backend
- **Database**: Supabase for data storage
- **API Routes**: Next.js API routes for server-side processing
- **Authentication**: Planned for future implementation

## Project Structure
```
task-voice-manager/
├── public/               # Static assets and PWA files
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   │   ├── tasks/        # Task-related components
│   │   └── voice/        # Voice recording components
│   ├── lib/              # Utility libraries
│   │   ├── mock/         # Mock implementations for development
│   │   ├── openai/       # OpenAI integration
│   │   └── supabase/     # Supabase client
│   ├── types/            # TypeScript type definitions
│   └── theme.ts          # MUI theme configuration
```

## Development Status
The current implementation includes:
- Basic UI components
- Voice recording functionality
- Task list with filtering and sorting
- AI integration for task parsing
- Confirmation dialog for parsed tasks

## Next Steps
1. Set up Supabase database with proper schema
2. Add user authentication
3. Enhance offline capabilities
4. Add image processing for task extraction from photos
5. Implement push notifications for task reminders

## Deployment
The app is designed to be deployed on Vercel for optimal performance with Next.js. 