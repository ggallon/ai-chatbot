'use client';

import { useChat } from '@ai-sdk/react';
import { useMemo, useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';

import { Artifact } from '@/components/artifact';
import { ChatHeader } from '@/components/chat-header';
import { Messages } from '@/components/messages';
import { MultimodalInput } from '@/components/multimodal-input';

import { useArtifactSelector } from '@/hooks/use-artifact';
import { fetcher } from '@/lib/utils/fetcher';
import { generateUUID } from '@/lib/utils/uuid';

import type { Attachment, Message } from 'ai';
import type { ChatVisibility, Vote } from '@/lib/db/schema';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<Message>;
  selectedModelId: string;
  selectedVisibilityType: ChatVisibility;
  isReadonly: boolean;
}) {
  const { mutate } = useSWRConfig();

  const {
    messages,
    setMessages,
    handleSubmit,
    input,
    setInput,
    append,
    isLoading,
    stop,
    reload,
  } = useChat({
    id,
    body: { modelId: selectedModelId },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true, // send id and createdAt for each message
    generateId: generateUUID,
    onFinish: (_, { finishReason }) => {
      if (messages.length === 0 && finishReason === 'stop') {
        mutate('/api/history');
      }
    },
  });

  const initialMessagesLength = initialMessages.length;
  const messagesLength = messages.length;
  const isLoadVotes = useMemo(
    () => !!isReadonly || initialMessagesLength >= 2 || messagesLength >= 2,
    [isReadonly, initialMessagesLength, messagesLength],
  );
  const { data: votes } = useSWR<Array<Vote>>(
    isLoadVotes ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);

  return (
    <>
      <div className="flex flex-col min-w-0 h-dvh bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          isLoading={isLoading}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="flex mx-auto px-4 bg-background pb-4 md:pb-6 gap-2 w-full md:max-w-3xl">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
              stop={stop}
              attachments={attachments}
              setAttachments={setAttachments}
              messages={messages}
              setMessages={setMessages}
              append={append}
            />
          )}
        </form>
      </div>

      <Artifact
        chatId={id}
        input={input}
        setInput={setInput}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        stop={stop}
        attachments={attachments}
        setAttachments={setAttachments}
        append={append}
        messages={messages}
        setMessages={setMessages}
        reload={reload}
        votes={votes}
        isReadonly={isReadonly}
      />
    </>
  );
}
