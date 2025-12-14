# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Commands

### Build & Development
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Run linting
npm run lint
```

### Testing
```bash
# Run Jest unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run Playwright E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Voice Recognition Testing
```bash
# Run test server for voice testing
./test-server.sh

# Open browser-based testing interface
# Navigate to http://localhost:3000/test
```

## Architecture Overview

Task Voice Manager is a Next.js 15 PWA for voice-enabled task management. The application uses a modern React architecture with TypeScript and integrates multiple AI services for voice transcription and natural language processing.

### Key Technical Components

1. **Voice Processing Pipeline**:
   - Browser's Web Speech API for real-time transcription
   - OpenAI Whisper API fallback for higher accuracy
   - Multi-language support (English, Hebrew, Spanish, French)
   - Real-time transcript display in UI

2. **AI Task Parsing**:
   - OpenAI GPT-4 for natural language understanding
   - Extracts: title, due date, assignee, tags, priority
   - JSON structured output with validation

3. **Authentication & Security**:
   - Supabase Auth with Row Level Security (RLS)
   - API rate limiting (100 calls/month for free tier)
   - Protected API routes with usage tracking

4. **Database Schema**:
   - `tasks` table: User tasks with RLS policies
   - `user_usage` table: API usage tracking
   - PostgreSQL with UUID primary keys

### Critical API Routes

- `/api/transcribe`: Whisper voice transcription (POST with FormData)
- `/api/tasks/parse`: GPT-4 task parsing with usage limits (POST with JSON)
- `/auth/callback`: Supabase auth callback handler (GET)

### Data Flow
1. Voice input → Web Speech API (real-time) + Whisper API (accuracy)
2. Text transcript → GPT-4 parsing → Structured task object
3. User confirmation → Save to Supabase → Update UI
4. Usage tracking → Rate limit enforcement

### State Management
- React Context for theme, language, and transcription state
- Local storage for user preferences
- Supabase real-time subscriptions for data sync

## Environment Variables

Required for production deployment:
```env
# OpenAI Configuration (SERVER-SIDE ONLY - never use NEXT_PUBLIC_ prefix)
OPENAI_API_KEY=sk-...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (server-side only)
```

**SECURITY WARNING**:
- Never use `NEXT_PUBLIC_OPENAI_API_KEY` - this exposes the key to client-side code
- The app uses a BYOK (Bring Your Own Key) pattern where users provide their own API keys via Settings
- User-provided keys are stored in localStorage for persistence (acceptable for personal BYOK apps)

## Important Implementation Details

### Voice Recording
The enhanced VoiceRecorder component (`src/components/voice/VoiceRecorder.tsx`) displays real-time transcripts in a blue rounded pill next to the microphone button. This is the correct UI implementation that should be maintained.

### Design System
The app uses a DesignSwitcher component to allow toggling between UI variations. Currently defaults to "Enhanced Task Manager" design. Multiple design components exist in `src/components/designs/` for different UI themes.

### Known Issues
- Voice recognition in Hebrew: Language selection not persisting in settings
- Mobile keyboard may interfere with voice input on some devices

### Performance Considerations
- First Contentful Paint target: <2s
- Voice recognition latency target: <500ms
- Bundle size optimization through code splitting
- Service worker for offline functionality (PWA)

### Security Notes
- **Never** use `NEXT_PUBLIC_` prefix for API keys (e.g., `NEXT_PUBLIC_OPENAI_API_KEY`)
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code
- API routes validate authentication before processing
- Rate limiting enforced at API level
- RLS policies ensure data isolation between users
- CSRF protection via origin validation in middleware
- User API keys stored in localStorage (BYOK pattern for personal tools)