import { notFound } from 'next/navigation';
import { cache } from 'react';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/ai/utils';
import { getChatByIdWithMessages } from '@/lib/db/queries/chat';
import { getMessagesByChatId } from '@/lib/db/queries/message';
import { getFormatedChatTitle } from '@/lib/utils/get-formated-chat-title';

const getPublicChatByIdWithMessages = cache(async ({ id }: { id: string }) => {
  return await getChatByIdWithMessages({ id, visibility: 'public' });
});

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const chat = await getPublicChatByIdWithMessages({ id: params.id });
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
  const chat = await getPublicChatByIdWithMessages({ id: params.id });
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
