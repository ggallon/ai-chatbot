import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { convertToUIMessages } from '@/lib/ai/utils';
import { getSelectedModelId } from '@/lib/utils/get-selected-model-id';
import { getChatById } from '@/lib/db/queries/chat';
import { getMessagesByChatId } from '@/lib/db/queries/message';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const [session, selectedModelId, params] = await Promise.all([
    auth(),
    getSelectedModelId(),
    props.params,
  ]);

  if (!session?.user?.id) {
    notFound();
  }

  const chat = await getChatById({ id: params.id });
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
