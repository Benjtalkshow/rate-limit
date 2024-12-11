import { NextRequest, NextResponse } from 'next/server'
import { Ratelimit } from "@upstash/ratelimit"
import redis from './lib/redis'

export const config = {
  matcher: [
    '/api/:path*',
  ],
}

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(20, "10 s"),
  prefix: "@upstash/ratelimit",
  analytics: true
});

console.log("Rate limiter initialized:", ratelimit);

export async function middleware(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || "127.0.0.1";
  const identifier = ip;
  console.log("Request received from IP:", ip);

  const { success, limit, remaining, reset } = await ratelimit.limit(identifier);

  console.log("Rate limit check for IP:", ip, "Success:", success, "Remaining:", remaining, "Reset:", reset);

  if (!success) {
    return NextResponse.json({
      message: 'Rate limit exceeded',
      limit,
      remaining,
      reset
    }, {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      }
    });
  }

  return NextResponse.next({
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString(),
    }
  });
}