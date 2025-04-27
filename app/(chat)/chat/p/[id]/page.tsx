import { notFound } from 'next/navigation';
import { cache } from 'react';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/ai/utils';
import { getChatByIdWithMessages } from '@/lib/db/queries/chat';
import { getFormatedChatTitle } from '@/lib/utils/get-formated-chat-title';

import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getPublicChatByIdWithMessages = cache(async ({ id }: { id: string }) => {
  return await getChatByIdWithMessages({ id, visibility: 'public' });
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const id = (await params).id;
  const chat = await getPublicChatByIdWithMessages({ id });
  if (!chat) {
    notFound();
  }

  return {
    title: getFormatedChatTitle({
      title: chat.title,
    }),
  };
}

export default async function Page({ params }: PageProps) {
  const id = (await params).id;
  const chat = await getPublicChatByIdWithMessages({ id });
  if (!chat) {
    notFound();
  }

  return (
    <Chat
      id={chat.id}
      initialMessages={convertToUIMessages(chat.messages)}
      selectedModelId={DEFAULT_MODEL_NAME}
      selectedVisibilityType="public"
      isReadonly={true}
    />
  );
}
