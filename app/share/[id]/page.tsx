import { type Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ChatList } from '@/components/chat-list'
import { FooterText } from '@/components/footer'
import { getSharedChat } from '@/app/actions'
import { type Chat } from '@/lib/types'
import { formatDate } from '@/lib/utils'
import { size } from './[slug]/_template'

export const runtime = 'edge'
export const preferredRegion = 'home'

interface SharePageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({
  params
}: SharePageProps): Promise<Metadata> {
  const chat: Chat | null = await getSharedChat(params.id)
  const title = chat?.title.toString().slice(0, 50) ?? 'Chat'

  return {
    title,
    openGraph: {
      title,
      images: [
        {
          url: `/share/${chat?.id}/og-image-${chat?.id}.png`,
          width: size.width,
          height: size.height
        }
      ],
      type: 'website'
    }
  }
}

export default async function SharePage({ params }: SharePageProps) {
  const chat = await getSharedChat(params.id)

  if (!chat || !chat?.sharePath) {
    notFound()
  }

  return (
    <>
      <div className="flex-1 space-y-6">
        <div className="border-b bg-background px-4 py-6 md:px-6 md:py-8">
          <div className="mx-auto max-w-2xl md:px-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{chat.title}</h1>
              <div className="text-sm text-muted-foreground">
                {formatDate(chat.createdAt)} · {chat.messages.length} messages
              </div>
            </div>
          </div>
        </div>
        <ChatList messages={chat.messages} />
      </div>
      <FooterText className="py-8" />
    </>
  )
}
