import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { DEFAULT_MODEL_NAME, models } from '@/lib/ai/models';
import { convertToUIMessages } from '@/lib/ai/utils';
import { getChatById, getMessagesByChatId } from '@/lib/db/queries';

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const [session, cookieStore, params] = await Promise.all([
    auth(),
    cookies(),
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

  const modelIdFromCookie = cookieStore.get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

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
