import type { NextRequest } from 'next/server'

import { GET as AuthGET } from '@/auth'

export { POST } from '@/auth'

// Showcasing advanced initialization in Route Handlers
export async function GET(request: NextRequest) {
  // Do something with request
  const response = await AuthGET(request)
  // Do something with response
  return response
}
