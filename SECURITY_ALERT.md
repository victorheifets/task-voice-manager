# 🚨 CRITICAL SECURITY ALERT - OpenAI API Key Exposure

**Date:** November 7, 2025
**Severity:** CRITICAL
**Status:** FIXED (Code updated, but API key rotation required)

---

## Issue Summary

The application was **exposing the OpenAI API key to client-side code** using `NEXT_PUBLIC_OPENAI_API_KEY` and `dangerouslyAllowBrowser: true`.

This means:
- Anyone visiting the website could extract the API key from browser JavaScript
- The API key was visible in network requests and browser dev tools
- Unauthorized users could use your API key, leading to:
  - **Financial loss** (unexpected API charges)
  - **Rate limit exhaustion** (service disruption)
  - **Potential abuse** (malicious usage under your account)

---

## What Was Fixed

✅ **1. Removed Client-Side OpenAI Usage**
- Updated `src/features/tasks/TaskInput.tsx` to use server-side API
- Updated `src/components/tasks/TaskInput.tsx` to use server-side API
- Renamed dangerous `src/lib/openai/parser.ts` to `parser.ts.DEPRECATED_SECURITY_RISK`

✅ **2. Updated Environment Configuration**
- Created proper `.env.example` with security notes
- Removed `NEXT_PUBLIC_OPENAI_API_KEY` documentation
- Added warnings about NEVER using NEXT_PUBLIC_ prefix for API keys

✅ **3. Verified Server-Side API Route**
- Confirmed `/api/tasks/parse` route exists and is secure
- Server-side route uses `process.env.OPENAI_API_KEY` (not exposed to client)
- Route has authentication checks and rate limiting

---

## ⚠️ REQUIRED ACTION: Rotate API Key Immediately

**You MUST rotate your OpenAI API key if it was ever deployed with the client-side code.**

### Steps to Rotate API Key:

1. **Go to OpenAI Platform:**
   - Visit https://platform.openai.com/api-keys
   - Log in to your account

2. **Revoke Compromised Key:**
   - Find the existing API key (starts with `sk-...`)
   - Click "Delete" or "Revoke" to invalidate it
   - This prevents any future unauthorized use

3. **Generate New Key:**
   - Click "Create new secret key"
   - Give it a descriptive name (e.g., "Task Voice Manager - Production")
   - Copy the new key immediately (you won't see it again)

4. **Update Environment Variables:**
   - Open `.env.local` on your production server
   - Replace `OPENAI_API_KEY` with the new key
   - **Verify** it does NOT have `NEXT_PUBLIC_` prefix
   - Restart your application

5. **Update Deployment:**
   - If using Vercel/Netlify/AWS, update environment variables in dashboard
   - Redeploy the application with the new key

---

## How to Verify the Fix

### ✅ Check Client-Side Code:
```bash
# This should return ZERO results
grep -r "NEXT_PUBLIC_OPENAI_API_KEY" src/
grep -r "dangerouslyAllowBrowser" src/
```

### ✅ Check Network Requests:
1. Open browser Dev Tools (F12)
2. Go to Network tab
3. Add a task using the UI
4. Check the `/api/tasks/parse` request
5. Verify the request headers do **NOT** contain `Authorization: Bearer sk-...`
6. The API key should **NEVER** be visible in browser requests

### ✅ Check Environment Files:
```bash
# Ensure .env.local is gitignored
git check-ignore .env.local  # Should return: .env.local

# Ensure no API keys in git history
git log --all --full-history --source -- '*env*' | grep -i "NEXT_PUBLIC_OPENAI"
```

---

## Security Best Practices Going Forward

### ✅ DO:
- Use server-side API routes for ALL external API calls
- Keep API keys in `.env.local` (never commit to git)
- Use `process.env.API_KEY` for server-side code
- Implement rate limiting on API routes
- Add authentication checks to all API endpoints

### ❌ DON'T:
- NEVER use `NEXT_PUBLIC_` prefix for API keys
- NEVER use `dangerouslyAllowBrowser: true`
- NEVER make OpenAI/external API calls from client components
- NEVER commit `.env.local` to git
- NEVER share API keys in code, screenshots, or logs

---

## Additional Security Measures

Consider implementing these additional safeguards:

1. **API Key Restrictions** (OpenAI Dashboard):
   - Set usage limits ($5/month cap for testing)
   - Restrict to specific IP addresses (if possible)
   - Enable email alerts for unusual usage

2. **Monitoring:**
   - Set up usage alerts in OpenAI dashboard
   - Monitor daily API costs
   - Review usage logs weekly

3. **Rate Limiting:**
   - Server-side API already has 100 calls/month limit
   - Consider adding per-user rate limiting
   - Implement request throttling

---

## Timeline

- **November 6, 2025**: Vulnerability discovered during security audit
- **November 7, 2025**: Code fixed, dangerous files renamed, documentation updated
- **Next Step**: **YOU MUST ROTATE API KEY IMMEDIATELY**

---

## Questions?

If you're unsure whether your API key was compromised:
- Check OpenAI usage logs for unexpected activity
- Look for API calls from unknown IP addresses
- Review billing for unexplained charges
- **When in doubt, rotate the key immediately**

---

**Remember:** Rotating API keys is a standard security practice and takes only 5 minutes. It's always better to be safe!
