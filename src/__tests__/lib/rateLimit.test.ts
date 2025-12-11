import { checkRateLimit, RATE_LIMITS } from '@/lib/rateLimit';

describe('rateLimit', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests within rate limit', () => {
    const identifier = 'test-user-1';
    const config = { maxRequests: 3, windowMs: 60000 };

    const result1 = checkRateLimit(identifier, config);
    expect(result1.allowed).toBe(true);
    expect(result1.remaining).toBe(2);

    const result2 = checkRateLimit(identifier, config);
    expect(result2.allowed).toBe(true);
    expect(result2.remaining).toBe(1);

    const result3 = checkRateLimit(identifier, config);
    expect(result3.allowed).toBe(true);
    expect(result3.remaining).toBe(0);
  });

  it('should block requests exceeding rate limit', () => {
    const identifier = 'test-user-2';
    const config = { maxRequests: 2, windowMs: 60000 };

    checkRateLimit(identifier, config);
    checkRateLimit(identifier, config);

    const result = checkRateLimit(identifier, config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset after window expires', () => {
    const identifier = 'test-user-3';
    const config = { maxRequests: 1, windowMs: 60000 };

    // First request allowed
    const result1 = checkRateLimit(identifier, config);
    expect(result1.allowed).toBe(true);

    // Second request blocked
    const result2 = checkRateLimit(identifier, config);
    expect(result2.allowed).toBe(false);

    // Advance time past the window
    jest.advanceTimersByTime(61000);

    // Should be allowed again
    const result3 = checkRateLimit(identifier, config);
    expect(result3.allowed).toBe(true);
  });

  it('should track different identifiers separately', () => {
    const config = { maxRequests: 1, windowMs: 60000 };

    const result1 = checkRateLimit('user-a', config);
    expect(result1.allowed).toBe(true);

    const result2 = checkRateLimit('user-b', config);
    expect(result2.allowed).toBe(true);

    // user-a's second request should be blocked
    const result3 = checkRateLimit('user-a', config);
    expect(result3.allowed).toBe(false);
  });

  it('should have correct RATE_LIMITS configuration', () => {
    expect(RATE_LIMITS.TRANSCRIBE.maxRequests).toBe(10);
    expect(RATE_LIMITS.TRANSCRIBE.windowMs).toBe(60000);

    expect(RATE_LIMITS.PARSE.maxRequests).toBe(20);
    expect(RATE_LIMITS.PARSE.windowMs).toBe(60000);

    expect(RATE_LIMITS.ANONYMOUS.maxRequests).toBe(100);
    expect(RATE_LIMITS.ANONYMOUS.windowMs).toBe(86400000);
  });
});
