'use client';

import cx from 'classnames';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';

import { cn } from '@/lib/utils/cn';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { MessageEditor } from './message-editor';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import type { ChatRequestOptions, Message } from 'ai';
import { isAllowedTool } from '@/lib/ai/tools';
import type { Vote } from '@/lib/db/schema';

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
}: {
  chatId: string;
  message: Message;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const toggleEditMode = useCallback(() => setMode('edit'), []);

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          <div className="size-7 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
            {message.role === 'user' ? (
              <Image
                src="https://avatar.vercel.sh/user_email"
                alt="user_email"
                width={20}
                height={20}
                className="rounded-full"
                unoptimized={true}
              />
            ) : (
              <SparklesIcon size={12} />
            )}
          </div>

          <div className="flex flex-col gap-2 w-full">
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div className="flex flex-row justify-start gap-2">
                  {message.experimental_attachments.map((attachment) => (
                    <PreviewAttachment
                      key={attachment.url}
                      attachment={attachment}
                    />
                  ))}
                </div>
              )}

            {message.role === 'assistant' &&
              message.parts?.map((part) => {
                if (part.type === 'tool-invocation') {
                  const toolName = part.toolInvocation.toolName;

                  if (isAllowedTool(toolName)) {
                    if (part.toolInvocation.state === 'result') {
                      return (
                        <div
                          key={part.toolInvocation.toolCallId}
                          className="flex flex-col gap-4"
                        >
                          {toolName === 'getWeather' ? (
                            <Weather
                              weatherAtLocation={part.toolInvocation.result}
                            />
                          ) : (
                            <DocumentToolResult
                              type={toolName}
                              result={part.toolInvocation.result}
                              isReadonly={isReadonly}
                            />
                          )}
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={part.toolInvocation.toolCallId}
                          className="flex flex-col gap-4"
                        >
                          {toolName === 'getWeather' ? (
                            <div className="skeleton">
                              <Weather />
                            </div>
                          ) : (
                            <DocumentToolCall
                              type={toolName}
                              args={part.toolInvocation.args}
                              isReadonly={isReadonly}
                            />
                          )}
                        </div>
                      );
                    }
                  }
                }
                return null;
              })}

            {message.content && mode === 'view' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="flex flex-col prose dark:prose-invert max-w-none prose-p:mb-2 prose-ol:my-0">
                  <Markdown>{message.content as string}</Markdown>
                </div>
                {message.role === 'user' && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          toggleEditMode();
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}
              </div>
            )}

            {!isReadonly && message.role === 'user' && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <MessageEditor
                  key={message.id}
                  message={message}
                  setMessages={setMessages}
                  setMode={setMode}
                  reload={reload}
                />
                <div className="size-8" />
              </div>
            )}

            {!isReadonly && message.role === 'assistant' && !isLoading && (
              <MessageActions
                key={message.id}
                chatId={chatId}
                messageId={message.id}
                messageContent={message.content}
                vote={vote}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (!equal(prevProps.message.parts, nextProps.message.parts)) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role="assistant"
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
