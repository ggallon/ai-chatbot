import { notFound } from 'next/navigation';

import { Chat } from '@/components/chat-next';
import { ChatHeader } from '@/components/chat-header';
import { DEFAULT_MODEL_NAME } from '@/lib/ai/models';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';
import { convertToUIMessages } from '@/lib/utils';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const chat = await getChatById({ id: params.id, visibility: 'public' });
  if (!chat) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id: chat.id });

  return (
    <div className="flex flex-col min-w-0 h-dvh bg-background">
      <ChatHeader
        chatId={chat.id}
        selectedModelId={DEFAULT_MODEL_NAME}
        selectedVisibilityType="public"
        isReadonly={true}
      />
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(messagesFromDb)}
        selectedModelId={DEFAULT_MODEL_NAME}
        isReadonly={true}
      />
    </div>
  );
}
