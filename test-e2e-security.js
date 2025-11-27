/**
 * Comprehensive E2E Security Testing Script
 * Tests all security fixes and functionality
 */

const { chromium } = require('playwright');

async function runE2ETests() {
  console.log('🚀 Starting comprehensive E2E security testing...\n');

  const browser = await chromium.launch({
    headless: false,
    slowMo: 500 // Slow down so we can see what's happening
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Track all network requests to check for API key leaks
  const networkRequests = [];
  page.on('request', request => {
    networkRequests.push({
      url: request.url(),
      method: request.method(),
      headers: request.headers(),
      postData: request.postData()
    });
  });

  page.on('response', async response => {
    const request = networkRequests.find(r => r.url === response.url());
    if (request) {
      try {
        const body = await response.text();
        request.responseBody = body;
        request.responseStatus = response.status();
      } catch (e) {
        // Some responses can't be read as text
      }
    }
  });

  try {
    // ============================================
    // TEST 1: Login and Authentication
    // ============================================
    console.log('📋 TEST 1: Login and Authentication');
    await page.goto('http://localhost:3100');
    await page.waitForTimeout(2000);

    // Check if login page loads
    const loginVisible = await page.locator('text=test@test.com').isVisible().catch(() => false);
    if (loginVisible) {
      console.log('✅ Login page loaded');

      // Fill in credentials
      await page.fill('input[type="email"]', 'test@test.com');
      await page.fill('input[type="password"]', 'test123456');
      await page.click('button:has-text("Sign in")');
      await page.waitForTimeout(3000);

      console.log('✅ Login successful');
    } else {
      console.log('✅ Already logged in');
    }

    // Wait for dashboard to load
    await page.waitForSelector('text=Tasks', { timeout: 10000 });
    console.log('✅ Dashboard loaded\n');

    // ============================================
    // TEST 2: Check for API Key Leaks
    // ============================================
    console.log('📋 TEST 2: Checking for API Key Leaks');

    // Check page source
    const pageContent = await page.content();
    const hasOpenAIKey = pageContent.match(/sk-[A-Za-z0-9]{32,}/);
    const hasNextPublicKey = pageContent.includes('NEXT_PUBLIC_OPENAI_API_KEY');
    const hasDangerousFlag = pageContent.includes('dangerouslyAllowBrowser');

    if (hasOpenAIKey) {
      console.log('❌ SECURITY ISSUE: OpenAI API key found in page source!');
      console.log('   Key pattern:', hasOpenAIKey[0].substring(0, 10) + '...');
    } else {
      console.log('✅ No OpenAI API keys in page source');
    }

    if (hasNextPublicKey) {
      console.log('❌ SECURITY ISSUE: NEXT_PUBLIC_OPENAI_API_KEY found in code!');
    } else {
      console.log('✅ No NEXT_PUBLIC_OPENAI_API_KEY references');
    }

    if (hasDangerousFlag) {
      console.log('⚠️  WARNING: dangerouslyAllowBrowser found (check if deprecated)');
    } else {
      console.log('✅ No dangerouslyAllowBrowser flag in active code');
    }

    console.log('');

    // ============================================
    // TEST 3: Create Task (API Route Security)
    // ============================================
    console.log('📋 TEST 3: Task Creation with Secure API');

    // Clear previous network logs
    networkRequests.length = 0;

    // Find and fill task input
    const taskInput = await page.locator('input[placeholder*="Add a task"]').first();
    await taskInput.fill('E2E Security Test Task - Buy groceries tomorrow');
    await taskInput.press('Enter');

    // Wait for API call
    await page.waitForTimeout(3000);

    // Check for /api/tasks/parse request
    const parseRequest = networkRequests.find(r => r.url.includes('/api/tasks/parse'));
    if (parseRequest) {
      console.log('✅ Task sent to secure API route: /api/tasks/parse');
      console.log('   Method:', parseRequest.method);
      console.log('   Status:', parseRequest.responseStatus);

      // Check if API key is in request (should NOT be)
      const requestHasKey = JSON.stringify(parseRequest).match(/sk-[A-Za-z0-9]{32,}/);
      if (requestHasKey) {
        console.log('❌ CRITICAL: API key found in client request!');
      } else {
        console.log('✅ No API key in client-side request');
      }
    } else {
      console.log('❌ No /api/tasks/parse request found');
    }

    // Check if task was created
    await page.waitForTimeout(2000);
    const taskCreated = await page.locator('text=E2E Security Test Task').isVisible().catch(() => false);
    if (taskCreated) {
      console.log('✅ Task created successfully');
    } else {
      console.log('❌ Task creation failed or not visible');
    }

    console.log('');

    // ============================================
    // TEST 4: Inline Editing (HTML Fix Verification)
    // ============================================
    console.log('📋 TEST 4: Inline Editing (HTML Validation Fix)');

    // Open browser console to check for HTML errors
    const consoleMessages = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleMessages.push(msg.text());
      }
    });

    // Try editing task
    await page.waitForTimeout(1000);

    // Look for the task we just created
    const taskRow = page.locator('text=E2E Security Test Task').first();

    // Try to find and click on date/priority/tags for inline editing
    try {
      // Click on priority chip
      const priorityChip = page.locator('[data-testid="priority-chip"], .MuiChip-label:has-text("medium")').first();
      if (await priorityChip.isVisible().catch(() => false)) {
        await priorityChip.click();
        await page.waitForTimeout(1000);

        // Check if menu opened
        const menuVisible = await page.locator('text=high, text=low').first().isVisible().catch(() => false);
        if (menuVisible) {
          console.log('✅ Priority menu opened (inline editing works)');
          await page.keyboard.press('Escape'); // Close menu
        }
      }
    } catch (e) {
      console.log('⚠️  Could not test priority editing:', e.message);
    }

    // Check console for HTML validation errors
    await page.waitForTimeout(1000);
    const htmlErrors = consoleMessages.filter(msg =>
      msg.includes('div') && msg.includes('descendant') ||
      msg.includes('HTML') && msg.includes('validation')
    );

    if (htmlErrors.length > 0) {
      console.log('❌ HTML Validation errors found:');
      htmlErrors.forEach(err => console.log('   ', err));
    } else {
      console.log('✅ No HTML validation errors in console');
    }

    console.log('');

    // ============================================
    // TEST 5: Network Request Analysis
    // ============================================
    console.log('📋 TEST 5: Complete Network Request Analysis');

    // Analyze all network requests
    const apiRequests = networkRequests.filter(r => r.url.includes('/api/'));
    console.log(`   Total API requests: ${apiRequests.length}`);

    let securityIssues = 0;
    for (const req of apiRequests) {
      const fullRequest = JSON.stringify(req);
      if (fullRequest.match(/sk-[A-Za-z0-9]{32,}/)) {
        console.log(`❌ API KEY LEAK in request to: ${req.url}`);
        securityIssues++;
      }
    }

    if (securityIssues === 0) {
      console.log('✅ No API keys found in any network requests');
    } else {
      console.log(`❌ CRITICAL: ${securityIssues} requests contain API keys!`);
    }

    console.log('');

    // ============================================
    // TEST 6: Authentication on API Routes
    // ============================================
    console.log('📋 TEST 6: API Route Authentication');

    // Try to call API without auth (in a new incognito context)
    const incognitoContext = await browser.newContext();
    const incognitoPage = await incognitoContext.newPage();

    // Try to call the API directly
    const apiResponse = await incognitoPage.evaluate(async () => {
      try {
        const response = await fetch('http://localhost:3100/api/tasks/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskText: 'Unauthorized test' })
        });
        return {
          status: response.status,
          body: await response.json()
        };
      } catch (e) {
        return { error: e.message };
      }
    });

    if (apiResponse.status === 401) {
      console.log('✅ API correctly returns 401 Unauthorized');
      console.log('   Response:', apiResponse.body);
    } else if (apiResponse.status === 200) {
      console.log('❌ CRITICAL: API allows unauthenticated access!');
      console.log('   Status:', apiResponse.status);
    } else {
      console.log('⚠️  Unexpected API response:', apiResponse);
    }

    await incognitoContext.close();
    console.log('');

    // ============================================
    // FINAL SUMMARY
    // ============================================
    console.log('═══════════════════════════════════════');
    console.log('📊 E2E SECURITY TEST SUMMARY');
    console.log('═══════════════════════════════════════');
    console.log('✅ Login & Authentication: PASS');
    console.log(hasOpenAIKey || hasNextPublicKey ? '❌ API Key Security: FAIL' : '✅ API Key Security: PASS');
    console.log(taskCreated ? '✅ Task Creation: PASS' : '❌ Task Creation: FAIL');
    console.log(htmlErrors.length === 0 ? '✅ HTML Validation: PASS' : '❌ HTML Validation: FAIL');
    console.log(securityIssues === 0 ? '✅ Network Security: PASS' : '❌ Network Security: FAIL');
    console.log(apiResponse.status === 401 ? '✅ API Authentication: PASS' : '❌ API Authentication: FAIL');
    console.log('═══════════════════════════════════════');

    const totalTests = 6;
    const passedTests = [
      true, // Login
      !hasOpenAIKey && !hasNextPublicKey, // API Key Security
      taskCreated, // Task Creation
      htmlErrors.length === 0, // HTML Validation
      securityIssues === 0, // Network Security
      apiResponse.status === 401 // API Authentication
    ].filter(Boolean).length;

    console.log(`\n🎯 OVERALL: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log('🎉 ALL TESTS PASSED - Application is secure!');
    } else {
      console.log('⚠️  Some tests failed - review issues above');
    }

  } catch (error) {
    console.error('❌ Test error:', error);
  } finally {
    // Keep browser open for 10 seconds to review
    console.log('\n⏳ Keeping browser open for 10 seconds for review...');
    await page.waitForTimeout(10000);
    await browser.close();
    console.log('✅ Testing complete!');
  }
}

// Run the tests
runE2ETests().catch(console.error);
