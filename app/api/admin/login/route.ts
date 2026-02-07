// app/api/admin/login/route.ts
import { NextResponse } from 'next/server';

// Simple in-memory rate limiter
interface RateLimitEntry {
  attempts: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function getRateLimitKey(request: Request): string {
  // Get IP from headers (works with most hosting providers)
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 
             request.headers.get('x-real-ip') || 
             'unknown';
  return `login:${ip}`;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  // Clean up expired entries periodically
  if (rateLimitMap.size > 1000) {
    for (const [k, v] of rateLimitMap.entries()) {
      if (v.resetAt < now) {
        rateLimitMap.delete(k);
      }
    }
  }

  if (!entry || entry.resetAt < now) {
    // New window or expired entry
    const resetAt = now + WINDOW_MS;
    rateLimitMap.set(key, { attempts: 1, resetAt });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetAt };
  }

  if (entry.attempts >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.attempts++;
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.attempts, resetAt: entry.resetAt };
}

export async function POST(request: Request) {
  const rateLimitKey = getRateLimitKey(request);
  const rateLimit = checkRateLimit(rateLimitKey);

  if (!rateLimit.allowed) {
    const retryAfter = Math.ceil((rateLimit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: 'Too many login attempts. Please try again later.' },
      { 
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
        }
      }
    );
  }

  const { password } = await request.json();
  
  // Password check happens SERVER-SIDE only
  if (password === process.env.ADMIN_PASSWORD) {
    // Clear rate limit on successful login
    rateLimitMap.delete(rateLimitKey);
    
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_auth', 'true', {
      httpOnly: true, // Cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24,
    });
    return response;
  }
  
  return NextResponse.json({ error: 'Invalid' }, { status: 401 });
}