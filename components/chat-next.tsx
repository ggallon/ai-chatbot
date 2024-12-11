'use client';

import { useChat } from '@ai-sdk/react';

import { Messages } from './messages-next';

import type { Message } from 'ai';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  isReadonly: boolean;
}) {
  const { setMessages, isLoading, reload } = useChat({
    id,
    body: { id, modelId: selectedModelId },
    initialMessages,
  });

  return (
    <Messages
      chatId={id}
      isLoading={isReadonly ? false : isLoading}
      votes={[]}
      messages={initialMessages}
      setMessages={setMessages}
      reload={reload}
      isReadonly={isReadonly}
    />
  );
}
