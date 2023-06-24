import type { NextRequest } from 'next/server'

export const runtime = 'edge'
export { GET, POST } from '@/auth'

/*
 * Showcasing advanced initialization in Route Handlers
export async function GET(request: NextRequest) {
  // Do something with request
  const response = await AuthGET(request)
  // Do something with response
  return response
}
*/
