import { Ratelimit } from '@upstash/ratelimit'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import { Configuration, OpenAIApi } from 'openai-edge'
import { z } from 'zod'

import { auth } from '@/auth'
import { ratelimit } from '@/lib/upstash/ratelimit'
import { kv } from '@/lib/upstash/redis'
import { nanoid } from '@/lib/utils'
import { zValidateReq } from '@/lib/validate'

export const runtime = 'edge'

const schema = z.object({
  id: z.string().optional(),
  messages: z.array(
    z.object({
      content: z.string(),
      role: z.enum(['user', 'assistant', 'system']),
      name: z.string().optional()
    })
  )
})

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

const openai = new OpenAIApi(configuration)

export async function POST(req: Request) {
  const session = await auth()
  const user = session.user
  console.log('POST', session)
  console.log('user', user)
  if (user == null) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { success, limit, remaining, reset } = await ratelimit(
    true,
    Ratelimit.slidingWindow(50, '1 d')
  ).custum.limit(user.id)
  console.log('ratelimit', success)
  if (!success) {
    return new Response('You have reached your request limit for the day.', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString()
      }
    })
  }

  const json = await req.json()
  console.log('json', json)
  const { id: chatId, messages } = await zValidateReq(schema, req)
  console.log('chatId', chatId)
  const res = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages,
    temperature: 0.7,
    stream: true
  })
  console.log('title', messages[0].content.substring(0, 100))
  const stream = OpenAIStream(res, {
    async onCompletion(completion) {
      const title = messages[0].content.substring(0, 100)
      const userId = user.id
      if (userId) {
        const id = chatId ?? nanoid()
        const createdAt = Date.now()
        const path = `/chat/${id}`
        const payload = {
          id,
          title,
          userId,
          createdAt,
          path,
          messages: [
            ...messages,
            {
              content: completion,
              role: 'assistant'
            }
          ]
        }
        await kv.hmset(`chat:${id}`, payload)
        await kv.zadd(`user:chat:${userId}`, {
          score: createdAt,
          member: `chat:${id}`
        })
      }
    }
  })

  return new StreamingTextResponse(stream, {
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': reset.toString()
    }
  })
}
