'use client';

import { useChat } from '@ai-sdk/react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import useSWR, { useSWRConfig } from 'swr';

import { Artifact } from '@/components/artifact';
import { ChatHeader } from '@/components/chat-header';
import { Messages } from '@/components/messages';
import { MultimodalInput } from '@/components/multimodal-input';

import { useArtifactSelector } from '@/hooks/use-artifact';
import { fetcher } from '@/lib/utils/fetcher';
import { generateUUID } from '@/lib/utils/uuid';

import type { Attachment, UIMessage } from 'ai';
import type { ChatVisibility, Vote } from '@/lib/db/schema';

export function Chat({
  id,
  initialMessages,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  id: string;
  initialMessages: Array<UIMessage>;
  selectedModelId: string;
  selectedVisibilityType: ChatVisibility;
  isReadonly: boolean;
}) {
  const [attachments, setAttachments] = useState<Array<Attachment>>([]);
  const isArtifactVisible = useArtifactSelector((state) => state.isVisible);
  const { mutate } = useSWRConfig();
  const {
    append,
    handleSubmit,
    messages,
    input,
    reload,
    setInput,
    setMessages,
    status,
    stop,
  } = useChat({
    id,
    body: { modelId: selectedModelId },
    initialMessages,
    experimental_throttle: 100,
    sendExtraMessageFields: true, // send id and createdAt for each message
    generateId: generateUUID,
    onError: (error) => {
      console.log('chatError', error);
      toast.error('An error occured, please try again!');
    },
    onFinish: (_, { finishReason }) => {
      if (messages.length === 0 && finishReason === 'stop') {
        mutate('/api/history');
      }
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const messagesLength = messages.length;
  const isLoadVotes = useMemo(
    () => !isReadonly && !isLoading && messagesLength >= 2,
    [isLoading, isReadonly, messagesLength],
  );

  const { data: votes } = useSWR<Array<Vote>>(
    isLoadVotes ? `/api/vote?chatId=${id}` : null,
    fetcher,
  );

  return (
    <>
      <div className="flex h-dvh min-w-0 flex-col bg-background">
        <ChatHeader
          chatId={id}
          selectedModelId={selectedModelId}
          selectedVisibilityType={selectedVisibilityType}
          isReadonly={isReadonly}
        />

        <Messages
          chatId={id}
          status={status}
          votes={votes}
          messages={messages}
          setMessages={setMessages}
          reload={reload}
          isReadonly={isReadonly}
          isArtifactVisible={isArtifactVisible}
        />

        <form className="mx-auto flex w-full gap-2 bg-background px-4 pb-4 md:max-w-3xl md:pb-6">
          {!isReadonly && (
            <MultimodalInput
              chatId={id}
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              status={status}
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
        status={status}
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
