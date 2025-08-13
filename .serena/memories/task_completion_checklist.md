# Task Voice Manager - Task Completion Checklist

## Before Completing Any Task

### 1. Code Quality Checks
```bash
# Run linting to catch style and syntax issues
npm run lint

# Build the project to catch TypeScript errors
npm run build
```

### 2. Testing Requirements
```bash
# Run the comprehensive test suite if backend/API changes made
python run_tests.py

# For specific component testing, run relevant test files
pytest tests/test_activities.py -v

# If voice features modified, test with voice recording
./test-server.sh  # Manual testing at http://localhost:3000
```

### 3. TypeScript Validation
- Ensure no TypeScript errors in build output
- All types properly defined for new components/functions
- No `any` types unless absolutely necessary
- Proper null/undefined handling

### 4. Browser Compatibility Testing
- Test voice features in Chrome, Firefox, Safari (if voice-related changes)
- Verify mobile responsiveness on iOS/Android simulators
- Check PWA functionality if service worker modified

### 5. Database Schema Verification
- If database changes made, verify with Supabase console
- Test RLS policies are working correctly
- Ensure migration scripts are documented

## Task-Specific Completion Criteria

### Voice Feature Tasks
- [ ] Real-time transcription displays correctly in blue pill UI
- [ ] Voice recording starts/stops reliably
- [ ] Fallback to Whisper API works when browser speech fails
- [ ] Multi-language support functions (test Hebrew, English)
- [ ] Mobile keyboard doesn't interfere with voice input

### UI/UX Tasks
- [ ] Material-UI theme consistency maintained
- [ ] Dark/light mode switching works correctly
- [ ] Responsive design on mobile devices (375px+)
- [ ] Touch targets meet accessibility standards (44x44px minimum)
- [ ] Loading states and error handling properly implemented

### API/Backend Tasks
- [ ] Authentication properly enforced on protected routes
- [ ] API rate limiting working (100 calls/month for free tier)
- [ ] Error responses include helpful messages
- [ ] Usage tracking increments correctly
- [ ] OpenAI API keys never exposed to client-side

### Database Tasks
- [ ] RLS policies prevent unauthorized access
- [ ] Database queries optimized for performance
- [ ] Proper error handling for missing tables/columns
- [ ] Migration scripts tested and documented

## Performance Verification
- [ ] First Contentful Paint < 2s (use Lighthouse)
- [ ] Voice recognition latency < 500ms
- [ ] Bundle size hasn't increased significantly
- [ ] No memory leaks in voice recording components

## Security Checklist
- [ ] No secrets committed to repository
- [ ] Environment variables properly configured
- [ ] API endpoints validate input data
- [ ] RLS policies tested with different users
- [ ] CORS headers configured correctly

## Documentation Updates
- [ ] Update README.md if new features added
- [ ] Update API documentation if endpoints changed
- [ ] Update environment variable requirements
- [ ] Document known issues or limitations

## Pre-Commit Final Steps
```bash
# Final verification commands
npm run lint                 # Must pass
npm run build               # Must complete successfully
python run_tests.py        # If API changes made

# If all checks pass, ready to commit
git add .
git commit -m "descriptive commit message"
# DO NOT git push unless explicitly requested by user
```

## Common Issues to Check
1. **Hebrew voice recognition**: Verify language selection persists
2. **Mobile compatibility**: Test voice input on mobile browsers
3. **API key configuration**: Ensure server/client keys properly separated
4. **Supabase connectivity**: Test database operations work correctly
5. **PWA functionality**: Verify app can be installed and works offline

## Performance Monitoring
- Monitor OpenAI API usage to stay within rate limits
- Check Supabase database performance for slow queries
- Verify service worker updates properly for PWA features
- Test voice recognition accuracy across different browsers