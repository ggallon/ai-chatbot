import { notFound } from 'next/navigation';
import { cache } from 'react';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/ai/utils';
import { getChatById } from '@/lib/db/queries/chat';
import { getMessagesByChatId } from '@/lib/db/queries/message';
import { getFormatedChatTitle } from '@/lib/utils/get-formated-chat-title';

const getPublicChatById = cache(async (id: string) => {
  return await getChatById({ id, visibility: 'public' });
});

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const chat = await getPublicChatById(params.id);
  if (!chat) {
    notFound();
  }

  return {
    title: getFormatedChatTitle({
      title: chat.title,
    }),
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const chat = await getPublicChatById(params.id);
  if (!chat) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id: chat.id });

  return (
    <Chat
      id={chat.id}
      initialMessages={convertToUIMessages(messagesFromDb)}
      selectedModelId={DEFAULT_MODEL_NAME}
      selectedVisibilityType="public"
      isReadonly={true}
    />
  );
}
