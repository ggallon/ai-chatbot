import { ImageResponse } from 'next/server'

import { getSharedChat } from '@/app/actions'
import { template, size } from './_template'

export const runtime = 'edge'

const interRegular = fetch(
  new URL('../../../../assets/fonts/Inter-Regular.woff', import.meta.url)
).then(res => res.arrayBuffer())

const interBold = fetch(
  new URL('../../../../assets/fonts/Inter-Bold.woff', import.meta.url)
).then(res => res.arrayBuffer())

interface ImageProps {
  params: {
    id: string
  }
}

export async function GET(request: Request, { params }: ImageProps) {
  const chat = await getSharedChat(params.id)

  if (!chat || !chat?.sharePath) {
    return null
  }

  return new ImageResponse(template(chat), {
    ...size,
    fonts: [
      {
        name: 'Inter',
        data: await interRegular,
        style: 'normal',
        weight: 400
      },
      {
        name: 'Inter',
        data: await interBold,
        style: 'normal',
        weight: 700
      }
    ]
  })
}
