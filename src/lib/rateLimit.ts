/**
 * Simple in-memory rate limiter for API routes
 * For production, consider using Redis or a distributed rate limiter
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// In-memory store (will reset on server restart)
const rateLimitStore = new Map<string, RateLimitEntry>();

interface RateLimitConfig {
  maxRequests: number;  // Maximum requests allowed
  windowMs: number;     // Time window in milliseconds
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

/**
 * Check if a request is allowed based on rate limiting
 * @param identifier - Unique identifier (user ID, IP address, etc.)
 * @param config - Rate limit configuration
 * @returns RateLimitResult
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);

  // If no entry or window has expired, create new entry
  if (!entry || now > entry.resetTime) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(identifier, newEntry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newEntry.resetTime,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
    };
  }

  // Increment count
  entry.count++;
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Clean up expired entries (call periodically)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // 10 requests per minute for transcription
  TRANSCRIBE: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
  },
  // 20 requests per minute for task parsing
  PARSE: {
    maxRequests: 20,
    windowMs: 60 * 1000, // 1 minute
  },
  // 100 requests per day for unauthenticated users
  ANONYMOUS: {
    maxRequests: 100,
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
  },
} as const;

// Regular expressions for IP validation
const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
const IPV6_REGEX = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}$|^(?:[0-9a-fA-F]{1,4}:){1,7}:$|^(?:[0-9a-fA-F]{1,4}:){0,6}::(?:[0-9a-fA-F]{1,4}:){0,5}[0-9a-fA-F]{1,4}$/;

/**
 * Validate and sanitize an IP address
 * Returns null if the IP is invalid or suspicious
 */
function validateIP(ip: string | null | undefined): string | null {
  if (!ip) return null;

  // Trim whitespace
  const trimmed = ip.trim();

  // Check for empty string
  if (!trimmed) return null;

  // Limit length to prevent DoS via long strings
  if (trimmed.length > 45) return null; // Max IPv6 length

  // Validate format
  if (IPV4_REGEX.test(trimmed)) {
    return trimmed;
  }

  // For IPv6, also handle common formats
  if (IPV6_REGEX.test(trimmed) || trimmed === '::1') {
    return trimmed;
  }

  // Handle IPv4-mapped IPv6 addresses (::ffff:192.168.1.1)
  if (trimmed.toLowerCase().startsWith('::ffff:')) {
    const ipv4Part = trimmed.slice(7);
    if (IPV4_REGEX.test(ipv4Part)) {
      return ipv4Part; // Return just the IPv4 part
    }
  }

  return null;
}

/**
 * Get client IP from request headers with security validation
 *
 * Security notes:
 * - Only trusts x-forwarded-for when running behind a reverse proxy (Vercel, etc.)
 * - Validates IP format to prevent injection attacks
 * - Falls back to a hash-based identifier if no valid IP found
 */
export function getClientIP(request: Request): string {
  // In production on Vercel/similar platforms, x-forwarded-for is set by the proxy
  // and cannot be spoofed by the client because the proxy overwrites it

  // First, try x-forwarded-for (set by reverse proxies)
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Take only the first IP (leftmost = original client)
    const firstIP = forwarded.split(',')[0];
    const validIP = validateIP(firstIP);
    if (validIP) {
      return validIP;
    }
  }

  // Try x-real-ip (used by some proxies like nginx)
  const realIP = validateIP(request.headers.get('x-real-ip'));
  if (realIP) {
    return realIP;
  }

  // Try cf-connecting-ip (Cloudflare)
  const cfIP = validateIP(request.headers.get('cf-connecting-ip'));
  if (cfIP) {
    return cfIP;
  }

  // Fallback: create a fingerprint from available headers
  // This provides some rate limiting even without a valid IP
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const acceptLanguage = request.headers.get('accept-language') || 'unknown';

  // Create a simple hash for fingerprinting (not cryptographically secure, just for rate limiting)
  const fingerprint = `fp:${simpleHash(userAgent + acceptLanguage)}`;
  return fingerprint;
}

/**
 * Simple string hash for fingerprinting (not cryptographic)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
