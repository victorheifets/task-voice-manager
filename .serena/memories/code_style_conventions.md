# Task Voice Manager - Code Style & Conventions

## TypeScript Configuration
- **Strict mode enabled**: TypeScript strict: true
- **Target**: ES2017 with modern browser support
- **Module resolution**: bundler (Next.js optimized)
- **Path aliases**: `@/*` maps to `./src/*`
- **JSX**: preserve (Next.js handles transformation)

## Code Style Standards
- **Indentation**: 2 spaces for all files (TypeScript, JavaScript, JSON)
- **Line endings**: LF (Unix style)
- **Quotes**: Single quotes for strings, double quotes for JSX attributes
- **Semicolons**: Required (ESLint enforced)
- **Trailing commas**: Encouraged for multi-line objects/arrays

## Naming Conventions
- **Files**: kebab-case for components (`task-input.tsx`), camelCase for utilities
- **Components**: PascalCase (`TaskInput`, `VoiceRecorder`)
- **Functions/Variables**: camelCase (`getUserTasks`, `isRecording`)
- **Constants**: UPPER_SNAKE_CASE (`FREE_TIER_LIMIT`, `API_ENDPOINT`)
- **Types/Interfaces**: PascalCase (`Task`, `VoiceRecorderProps`)
- **Directories**: kebab-case (`components/voice`, `lib/supabase`)

## React/Next.js Patterns
- **Functional components** with hooks (no class components)
- **Client components**: `'use client'` directive at top when needed
- **Server components**: Default in App Router, avoid client-side code
- **Props interfaces**: Define TypeScript interfaces for all component props
- **State management**: React hooks (useState, useEffect, useContext)
- **Custom hooks**: Prefix with `use` (`useSpeechRecognition`)

## File Organization
```
src/
├── app/                 # Next.js App Router pages and API routes
├── components/          # Reusable UI components
│   ├── tasks/          # Task-specific components
│   ├── voice/          # Voice recording components
│   └── layout/         # Layout components
├── features/           # Feature-based component groupings
├── lib/                # Utility libraries and external service integrations
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── contexts/           # React context providers
└── data/               # Static data and sample data
```

## Component Structure
```typescript
'use client'; // Only if client-side features needed

import React from 'react';
import { SomeType } from '@/types/example';

interface ComponentProps {
  prop1: string;
  prop2?: number; // Optional props with ?
  onCallback?: (data: SomeType) => void;
}

export default function Component({ prop1, prop2, onCallback }: ComponentProps) {
  // Component logic
  return (
    // JSX with proper indentation
  );
}
```

## API Route Patterns
- **Server-side API key usage**: Never expose OpenAI API key to client
- **Authentication checks**: Verify Supabase auth on protected routes
- **Error handling**: Proper HTTP status codes and error messages
- **Type validation**: Validate request body structure
- **Rate limiting**: Check usage limits before API calls

## Material-UI Integration
- **Theme customization**: Centralized in `src/theme.ts`
- **sx prop**: Preferred for component-specific styling
- **Component overrides**: Global styling in theme configuration
- **Color palette**: Corporate styling with primary blue, professional grays
- **Responsive design**: Mobile-first approach with breakpoints

## Database Patterns
- **Row Level Security**: All tables have RLS policies by user_id
- **Error handling**: Graceful fallbacks for missing tables/columns
- **Type mapping**: Database snake_case to TypeScript camelCase
- **Optimistic updates**: Update UI immediately, sync with DB afterward

## Import Organization
1. React imports first
2. Third-party libraries
3. Internal components (using @/ alias)
4. Types and interfaces
5. Relative imports last

## Comments & Documentation
- **Minimal commenting**: Code should be self-documenting
- **JSDoc for public APIs**: Document exported functions with complex parameters
- **Inline comments**: Only for complex business logic or workarounds
- **TODO comments**: Include ticket/issue references when applicable