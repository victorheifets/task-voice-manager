import { NextRequest, NextResponse } from 'next/server';

/**
 * Security utilities for API routes
 */

// Allowed origins for CORS/CSRF validation
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://task-voice-manager.vercel.app',
  // Add your production domain here
];

/**
 * Validate request origin to prevent CSRF attacks
 * Returns true if the origin is valid, false otherwise
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // For same-origin requests, origin might be null
  if (!origin) {
    // Check referer as fallback
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        return ALLOWED_ORIGINS.some(allowed => {
          const allowedUrl = new URL(allowed);
          return refererUrl.origin === allowedUrl.origin;
        });
      } catch {
        return false;
      }
    }
    // No origin or referer - allow for same-origin navigation requests
    // but be cautious for POST/PUT/DELETE
    return request.method === 'GET' || request.method === 'HEAD';
  }

  // Check if origin is in allowed list
  return ALLOWED_ORIGINS.some(allowed => {
    try {
      const allowedUrl = new URL(allowed);
      return origin === allowedUrl.origin;
    } catch {
      return false;
    }
  });
}

/**
 * Create a CSRF rejection response
 */
export function csrfRejectionResponse(): NextResponse {
  return NextResponse.json(
    { error: 'Invalid request origin' },
    { status: 403 }
  );
}

/**
 * Validate that request is from a legitimate source
 * This is a simple origin check - for production, consider using
 * proper CSRF tokens with cookies
 */
export function validateRequest(request: NextRequest): { valid: boolean; error?: string } {
  // Only validate for state-changing methods
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    // Check content type for JSON endpoints
    const contentType = request.headers.get('content-type');

    // For file uploads (FormData), content-type will be multipart/form-data
    const _isMultipart = contentType?.includes('multipart/form-data');
    const _isJson = contentType?.includes('application/json');

    // Validate origin for all state-changing requests
    if (!validateOrigin(request)) {
      return { valid: false, error: 'Invalid request origin' };
    }
  }

  return { valid: true };
}

/**
 * Add CORS headers to response
 */
export function addCorsHeaders(response: NextResponse, origin?: string | null): NextResponse {
  // Only add CORS headers if origin is provided and allowed
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Max-Age', '86400');
  }
  return response;
}

/**
 * Handle CORS preflight requests
 */
export function handleCorsPreflightRequest(request: NextRequest): NextResponse | null {
  if (request.method === 'OPTIONS') {
    const origin = request.headers.get('origin');
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, origin);
  }
  return null;
}

/**
 * Security middleware for API routes
 * Use this in individual API routes for additional security checks
 */
export async function withSecurity(
  request: NextRequest,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  // Handle CORS preflight
  const preflightResponse = handleCorsPreflightRequest(request);
  if (preflightResponse) {
    return preflightResponse;
  }

  // Validate request
  const validation = validateRequest(request);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.error },
      { status: 403 }
    );
  }

  // Execute handler
  const response = await handler();

  // Add CORS headers to response
  const origin = request.headers.get('origin');
  return addCorsHeaders(response, origin);
}
