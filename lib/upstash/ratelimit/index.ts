import { Ratelimit, type RatelimitConfig } from '@upstash/ratelimit'

import { kv } from '../redis'

/**
 * return a dummy ratelimiter with the function limit()
 * that always returns true
 */
const dummyRatelimit = {
  limit: () => ({
    success: true,
    limit: 0,
    remaining: 0,
    reset: Date.now(),
    pending: Promise.resolve()
  })
}

/**
 * Create new Ratelimit
 */
const baseRatelimit = (algorithm: RatelimitConfig['limiter'], run: boolean) => {
  return run && process.env.NODE_ENV !== 'development'
    ? new Ratelimit({
        redis: kv,
        limiter: algorithm,
        analytics: true,
        prefix: 'ai'
      })
    : dummyRatelimit
}

/**
 *  Ratelimiting algorithms
 *  https://github.com/upstash/ratelimit#ratelimiting-algorithms
 *
 *  Fixed Window: divides time into fixed durations/windows
 *  Sliding Window: divides time into rolling window
 *  Token Bucket: (Not yet supported for MultiRegionRatelimit)
 */
export const ratelimit = (
  run: boolean = true,
  custumLimiter?: RatelimitConfig['limiter']
) => ({
  // Sliding Window, that allows 10 requests per 10 seconds
  swTenBytenSds: baseRatelimit(Ratelimit.slidingWindow(10, '10s'), run),
  // Sliding Window, that allows 50 requests per 10 seconds
  swFiftyBytenSds: baseRatelimit(Ratelimit.slidingWindow(50, '10s'), run),
  // Fixed Window, that allows 10 requests per 60 seconds
  fwTenBySixtySds: baseRatelimit(Ratelimit.fixedWindow(10, '60s'), run),
  // custum
  custum: custumLimiter ? baseRatelimit(custumLimiter, run) : dummyRatelimit
})
