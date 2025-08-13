# Task Voice Manager - Architecture Details

## Overall System Architecture

### Frontend Architecture (Next.js 15 App Router)
```
app/
├── layout.tsx              # Root layout with providers
├── page.tsx               # Main dashboard page
├── api/                   # API routes (server-side)
│   ├── transcribe/        # Whisper API endpoint
│   └── tasks/parse/       # GPT-4 task parsing endpoint
├── auth/callback/         # Supabase auth callback
└── [features]/            # Feature-specific pages
```

### Component Architecture
```
components/
├── tasks/                 # Task management components
│   ├── TaskInput.tsx     # Main input with AI integration
│   ├── TaskList.tsx      # Task display and management
│   ├── TaskFilters.tsx   # Advanced filtering
│   └── EnhancedTaskList.tsx # Enhanced UI version
├── voice/                # Voice recording components
│   ├── VoiceRecorder.tsx # Core recording component
│   └── FloatingMicButton.tsx # UI floating action button
├── designs/              # Multiple UI design variants
│   ├── EnhancedTaskManager.tsx # Default design
│   ├── DesignSwitcher.tsx # Design selection component
│   └── [other-designs]/  # Alternative UI themes
└── auth/                 # Authentication components
    ├── AuthProvider.tsx  # Auth context wrapper
    └── LoginForm.tsx     # User login interface
```

## Data Flow Architecture

### Voice Processing Pipeline
1. **Input Stage**: User speaks into microphone
2. **Real-time Processing**: Web Speech API provides live transcription
3. **Accuracy Enhancement**: Audio sent to OpenAI Whisper API as fallback
4. **Display**: Real-time transcript shown in blue rounded pill UI
5. **Confirmation**: User confirms/edits transcript before task creation

### AI Task Parsing Pipeline
1. **Input**: Natural language text from voice transcription
2. **API Call**: Text sent to `/api/tasks/parse` endpoint
3. **AI Processing**: OpenAI GPT-4o-mini parses text using structured prompt
4. **Output**: JSON object with title, dueDate, assignee, tags, priority
5. **Validation**: Client-side validation of parsed data structure
6. **Storage**: Confirmed task saved to Supabase database

### Authentication Flow
1. **User Login**: Supabase Auth handles OAuth/email authentication
2. **Session Management**: JWT tokens managed by Supabase client
3. **API Protection**: Server-side auth verification on all API routes
4. **RLS Enforcement**: Database-level security via Row Level Security policies

## Database Schema Design

### Tasks Table
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  assigned_to TEXT,
  tags TEXT[],
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS Policy
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only access their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id);
```

### Usage Tracking Table
```sql
CREATE TABLE user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  month TEXT NOT NULL, -- Format: YYYY-MM
  api_calls INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, month)
);
```

## API Architecture

### Server-Side API Routes (Next.js App Router)

#### `/api/transcribe` (POST)
- **Purpose**: High-quality audio transcription using OpenAI Whisper
- **Input**: FormData with audio file and language parameter
- **Processing**: Temporary file creation → Whisper API call → cleanup
- **Output**: JSON with transcribed text
- **Security**: Server-side OpenAI API key, file cleanup

#### `/api/tasks/parse` (POST)
- **Purpose**: AI-powered task parsing from natural language
- **Input**: JSON with taskText string
- **Processing**: Authentication check → usage limit verification → GPT-4 call → usage tracking
- **Output**: Structured task object (title, dueDate, assignee, tags, priority)
- **Rate Limiting**: 100 calls per month per user (free tier)

## State Management Architecture

### React Context Providers
```typescript
// App-level state management
<ThemeProvider>           // Dark/light mode, Material-UI theme
  <LanguageProvider>      // i18n language selection
    <TranscriptionProvider> // Voice transcription state
      <AuthProvider>      // Supabase authentication
        {children}
      </AuthProvider>
    </TranscriptionProvider>
  </LanguageProvider>
</ThemeProvider>
```

### Local State Patterns
- **Component State**: useState for UI interactions
- **Server State**: Direct Supabase client calls with real-time subscriptions
- **Form State**: Uncontrolled components with useRef for performance
- **Cache Strategy**: No external cache library, relies on React state + Supabase real-time

## Security Architecture

### Client-Side Security
- **API Key Separation**: Public keys for browser, private keys server-side only
- **Input Validation**: All user inputs validated before API calls
- **XSS Prevention**: React's built-in JSX sanitization
- **CSRF Protection**: Next.js built-in CSRF protection

### Server-Side Security
- **Authentication**: Supabase JWT verification on all protected routes
- **Rate Limiting**: API usage tracking and enforcement
- **Environment Variables**: Sensitive data in server-side env vars only
- **CORS**: Configured for production domain restrictions

### Database Security
- **Row Level Security**: All tables have RLS policies by user_id
- **Connection Security**: Supabase handles encrypted connections
- **Query Parameterization**: Supabase client prevents SQL injection
- **Audit Trail**: created_at/updated_at timestamps on all records

## Performance Architecture

### Frontend Optimization
- **Code Splitting**: Next.js automatic route-based splitting
- **Component Lazy Loading**: Dynamic imports for heavy components
- **Image Optimization**: Next.js Image component with WebP support
- **Bundle Analysis**: Built-in Next.js bundle analyzer

### Voice Processing Optimization
- **Dual Processing**: Browser Speech API for speed + Whisper for accuracy
- **Audio Compression**: WebM format for smaller file sizes
- **Streaming**: Real-time transcript display during recording
- **Fallback Strategy**: Graceful degradation when APIs unavailable

### Database Optimization
- **Indexed Queries**: Primary keys and user_id indexes
- **Real-time Subscriptions**: Efficient updates via Supabase websockets
- **Query Optimization**: Select only required columns
- **Connection Pooling**: Supabase handles connection management

## Deployment Architecture

### Production Environment
- **Hosting**: Vercel (Next.js optimized)
- **Database**: Supabase hosted PostgreSQL
- **CDN**: Vercel Edge Network for static assets
- **SSL**: Automatic HTTPS via Vercel

### Environment Configuration
- **Development**: Local Next.js dev server + Supabase cloud
- **Production**: Vercel deployment + Supabase production
- **Testing**: Local environment with Supabase test project