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

  let success, limit, remaining, reset;
  try {
    const result = await ratelimit.limit(identifier);
    success = result.success;
    limit = result.limit;
    remaining = result.remaining;
    reset = result.reset;

    console.log("Remaining requests for IP:", identifier, "Remaining:", remaining);
  } catch (error) {
    console.error("Error during rate limit check:", error);
    return NextResponse.json({
      message: 'Internal Server Error',
    }, {
      status: 500,
    });
  }

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