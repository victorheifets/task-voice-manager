# Task Voice Manager

A modern PWA application for managing tasks with voice input, AI-powered task parsing, and real-time transcription.

## Features

- 🎙️ **Voice Input**: Record voice commands to create tasks
- 🤖 **AI Task Parsing**: Uses OpenAI GPT to intelligently parse natural language into structured tasks
- 📝 **Real-time Transcription**: See your speech transcribed in real-time as you speak
- 🎯 **Smart Filters**: Filter tasks by status (Today, Tomorrow, Next Week, Overdue, Completed)
- 📱 **PWA Support**: Install as a mobile or desktop app
- 🌓 **Dark Mode**: Professional theme with corporate styling
- 🌍 **Multi-language**: Support for multiple languages (English, Hebrew, Spanish, French)

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd task-voice-manager
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the root directory:
```env
# OpenAI API Configuration (SERVER-SIDE ONLY)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Supabase Configuration (optional)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

> **Note**: Users can also configure their own API keys via the Settings tab (BYOK pattern).

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Configuration

### API Keys

1. **OpenAI API Key**: 
   - Sign up at [OpenAI Platform](https://platform.openai.com)
   - Generate an API key from the [API keys page](https://platform.openai.com/api-keys)
   - Add it to your `.env.local` file

2. **In-App Configuration**:
   - Navigate to the Config tab in the application
   - Enter your OpenAI API key in the API Configuration section
   - Configure voice recognition settings, notifications, and date/time formats

### Voice Recognition

The app uses:
- Browser's native Speech Recognition API for real-time transcription
- OpenAI Whisper API for high-quality audio transcription
- GPT-4 for intelligent task parsing

## Usage

### Creating Tasks with Voice

1. Click the microphone button or use the floating action button
2. Speak naturally, for example:
   - "Call John tomorrow at 3pm"
   - "Prepare presentation for Monday and send email to team"
   - "Meeting with Sarah next week about project updates"
3. The AI will parse your speech into structured tasks with:
   - Title
   - Due date
   - Assignee
   - Tags

### Task Management

- **Filter tasks** using the color-coded filter chips
- **Search tasks** using the search bar
- **View task details** by clicking on any task
- **Complete tasks** by checking the checkbox

### Notes

- Switch to the Notes tab to take quick notes
- Create multiple note tabs for different categories
- Edit tab names by hovering and clicking the edit icon

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Material-UI v5 with custom corporate theme
- **AI**: OpenAI GPT-4 and Whisper API
- **State Management**: React hooks
- **Styling**: Emotion CSS-in-JS
- **PWA**: Next.js PWA support

## Development

### Project Structure

```
src/
├── app/              # Next.js app directory
├── components/       # React components
│   ├── tasks/       # Task-related components
│   ├── voice/       # Voice recording components
│   └── layout/      # Layout components
├── lib/             # Utility libraries
│   ├── openai/      # OpenAI integration
│   └── supabase/    # Database client
├── theme.ts         # MUI theme configuration
└── types/           # TypeScript type definitions
```

### Key Components

- `TaskInput`: Main input component with AI integration
- `VoiceRecorder`: Voice recording with real-time transcription
- `TaskFilters`: Advanced filtering with depth effects
- `TaskList`: Task display and management

## License

MIT
