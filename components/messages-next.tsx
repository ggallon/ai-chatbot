import type { ChatRequestOptions, Message } from 'ai';
import equal from 'fast-deep-equal';
import { memo } from 'react';

import { PreviewMessage } from './message-next';
import { ThinkingMessage } from './message-thinking';
import { useScrollToBottom } from './use-scroll-to-bottom';
import { Overview } from './overview';

import type { Vote } from '@/lib/db/schema';

interface MessagesProps {
  chatId: string;
  isLoading: boolean;
  votes: Array<Vote> | undefined;
  messages: Array<Message>;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}

export const Messages = memo(
  function Messages({
    chatId,
    isLoading,
    votes,
    messages,
    setMessages,
    reload,
    isReadonly,
  }: MessagesProps) {
    const [messagesContainerRef, messagesEndRef] =
      useScrollToBottom<HTMLDivElement>();

    const messagesLength = messages.length;
    const messagesLengthLessOne = messagesLength - 1;

    return (
      <div
        ref={messagesContainerRef}
        className="flex flex-col min-w-0 gap-6 flex-1 overflow-y-scroll pt-4"
      >
        {messagesLength === 0 && <Overview />}

        {messages.map((message, index) => (
          <PreviewMessage
            key={message.id}
            chatId={chatId}
            message={message}
            isLoading={isLoading && messagesLengthLessOne === index}
            vote={
              votes
                ? votes.find((vote) => vote.messageId === message.id)
                : undefined
            }
            setMessages={setMessages}
            reload={reload}
            isReadonly={isReadonly}
          />
        ))}

        {isLoading &&
          messagesLength > 0 &&
          messages[messagesLengthLessOne].role === 'user' && (
            <ThinkingMessage />
          )}

        <div
          ref={messagesEndRef}
          className="shrink-0 min-w-[24px] min-h-[24px]"
        />
      </div>
    );
  },
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.isLoading && nextProps.isLoading) return false;
    if (prevProps.messages.length !== nextProps.messages.length) return false;
    if (!equal(prevProps.votes, nextProps.votes)) return false;

    return true;
  },
);
