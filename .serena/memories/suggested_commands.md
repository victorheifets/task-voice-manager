# Task Voice Manager - Essential Development Commands

## Development Setup
```bash
# Install dependencies
npm install

# Run development server
npm run dev                 # Starts on http://localhost:3000

# Build for production
npm run build

# Run production build
npm start

# Linting
npm run lint               # Next.js ESLint with TypeScript rules
```

## Testing Commands
```bash
# Run comprehensive Python test suite (API testing)
python run_tests.py        # Runs pytest + starts web server for HTML report

# Run specific test file
pytest tests/test_activities.py -v

# Run single test method
pytest tests/test_activities.py::test_specific_function -v

# Run with coverage and HTML report
pytest --cov=src tests/ --html=report.html --self-contained-html

# Quick test server for voice testing
./test-server.sh           # Bash script that runs tests + web server
```

## Voice Recognition Testing
```bash
# Run test server for voice testing
./test-server.sh

# Open browser testing interface
# Navigate to http://localhost:3000/test (if available)
```

## Database & Environment
```bash
# Check Supabase connection and tables
node create-table-simple.js

# Setup production database
psql -f setup_production_database.sql

# Direct database migration
node direct-pg-migration.js
```

## MCP & Development Tools
```bash
# Fix and launch MCP servers
./fix_and_launch_mcps.sh

# Diagnose MCP issues
./mcp-diagnose-fix.sh

# Start all MCP servers
./start-all-mcps.sh
```

## System Commands (macOS Darwin)
```bash
# File operations
ls -la                     # List directory contents
find . -name "*.tsx"       # Find TypeScript React files
grep -r "searchTerm" src/  # Search in source code
rg "pattern" src/          # Use ripgrep for faster search

# Process management
ps aux | grep node         # Find Node.js processes
lsof -ti:3000             # Find process using port 3000
kill -9 $(lsof -ti:3000)  # Kill process on port 3000

# Git operations
git status
git add .
git commit -m "message"
git push origin main
```

## Environment Variables Required
```env
# OpenAI Configuration
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_OPENAI_API_KEY=sk-...

# Supabase Configuration  
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (server-side only)
```