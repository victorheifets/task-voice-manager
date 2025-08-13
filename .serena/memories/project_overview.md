# Task Voice Manager - Project Overview

## Purpose
Task Voice Manager is a modern Next.js 15 PWA (Progressive Web App) for voice-enabled task management with AI-powered natural language processing. Users can create tasks by speaking naturally, and the system uses OpenAI's GPT-4 and Whisper APIs to parse speech into structured tasks.

## Key Features
- 🎙️ **Voice Input**: Real-time speech recognition using Web Speech API + OpenAI Whisper fallback
- 🤖 **AI Task Parsing**: OpenAI GPT-4 intelligently extracts title, due date, assignee, tags, priority from natural language
- 📝 **Real-time Transcription**: Live display of speech as you speak in a blue rounded pill UI
- 🎯 **Smart Filters**: Filter tasks by Today, Tomorrow, Next Week, Overdue, Completed
- 📱 **PWA Support**: Installable as mobile/desktop app
- 🌓 **Dark/Light Mode**: Professional corporate styling with Material-UI
- 🌍 **Multi-language**: English, Hebrew, Spanish, French support
- 📊 **Usage Tracking**: API call limits and monitoring (100 calls/month free tier)

## Tech Stack
- **Framework**: Next.js 15 (App Router) with React 19
- **Language**: TypeScript (strict mode)
- **UI Library**: Material-UI v6 with Emotion CSS-in-JS
- **Styling**: Tailwind CSS v4 + Material-UI theming
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth
- **AI Services**: OpenAI GPT-4o-mini and Whisper APIs
- **Speech**: Web Speech API + OpenAI Whisper fallback
- **Internationalization**: i18next with browser language detection
- **Build Tool**: Next.js built-in bundler
- **PWA**: Next.js PWA capabilities

## Core Architecture
1. **Voice Pipeline**: Browser Speech API → Real-time transcript → Whisper API fallback
2. **AI Processing**: Natural language → GPT-4 parsing → Structured task object
3. **Data Flow**: Task creation → Supabase storage → Real-time UI updates
4. **Authentication**: Supabase Auth → RLS policies → Secure API access

## Database Schema
- `tasks` table: User tasks with RLS policies by user_id
- `user_usage` table: API usage tracking per user per month
- `user_notes` table: User notes storage (optional feature)

## Known Issues
- Voice recognition in Hebrew: Language selection not persisting in settings
- Mobile keyboard interference with voice input on some devices
- npm audit shows 2 critical vulnerabilities in dependencies