import { notFound, redirect } from 'next/navigation';
import { cache } from 'react';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { convertToUIMessages } from '@/lib/ai/utils';
import { getSelectedModelId } from '@/lib/utils/get-selected-model-id';
import {
  getChatById,
  getChatByIdWithMessagesAndVotes,
} from '@/lib/db/queries/chat';
import { getFormatedChatTitle } from '@/lib/utils/get-formated-chat-title';

import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
}

const getCacheChatById = cache(async (id: string) => {
  return await getChatById({ id });
});

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const chatId = (await params).id;
  const chat = await getCacheChatById(chatId);
  if (!chat) {
    notFound();
  }

  return {
    title: getFormatedChatTitle({
      title: chat.title,
    }),
  };
}

export default async function Page(props: PageProps) {
  const [session, selectedModelId, params] = await Promise.all([
    auth(),
    getSelectedModelId(),
    props.params,
  ]);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const chat = await getChatByIdWithMessagesAndVotes({
    id: params.id,
    sessionUserId: session.user.id,
  });
  if (!chat) {
    notFound();
  }

  return (
    <>
      <Chat
        id={chat.id}
        initialMessages={convertToUIMessages(chat.messages)}
        selectedModelId={selectedModelId}
        selectedVisibilityType={chat.visibility}
        isReadonly={chat.userId !== session.user.id}
      />
      <DataStreamHandler id={chat.id} />
    </>
  );
}
