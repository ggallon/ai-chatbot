import { notFound } from 'next/navigation';

import { Chat } from '@/components/chat';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/ai/utils';
import { getChatById } from '@/lib/db/queries/chat';
import { getMessagesByChatId } from '@/lib/db/queries/message';

export async function generateMetadata(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const chat = await getChatById({ id: params.id, visibility: 'public' });

  if (!chat) {
    notFound();
  }

  return {
    title:
      chat.title.length <= 57
        ? chat.title
        : `${chat.title.toString().slice(0, 57)}...`,
  };
}

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const chat = await getChatById({ id: params.id, visibility: 'public' });
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
