import { notFound } from 'next/navigation';
import { cache } from 'react';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { convertToUIMessages } from '@/lib/ai/utils';
import { getSelectedModelId } from '@/lib/utils/get-selected-model-id';
import { getChatById } from '@/lib/db/queries/chat';
import { getMessagesByChatId } from '@/lib/db/queries/message';
import { getFormatedChatTitle } from '@/lib/utils/get-formated-chat-title';

const getCacheChatById = cache(async (id: string) => {
  return await getChatById({ id });
});

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const chat = await getCacheChatById(params.id);

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
  const [session, selectedModelId, params] = await Promise.all([
    auth(),
    getSelectedModelId(),
    props.params,
  ]);

  if (!session?.user?.id) {
    notFound();
  }

  const chat = await getCacheChatById(params.id);
  if (!chat) {
    notFound();
  }

  const isChatOwner = chat.userId === session.user.id;
  if (chat.visibility === 'private' && !isChatOwner) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id: chat.id });

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={selectedModelId}
        selectedVisibilityType={chat.visibility}
        isReadonly={!isChatOwner}
      />
      <DataStreamHandler id={chat.id} />
    </>
  );
}
