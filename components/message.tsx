'use client';

import cx from 'classnames';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';

import { isAllowedTool } from '@/lib/ai/tools';
import { cn } from '@/lib/utils/cn';
import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeTypes,
} from '@/lib/db/validations/file';
import { DocumentToolCall, DocumentToolResult } from './document';
import { PencilEditIcon, SparklesIcon } from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { MessageEditor } from './message-editor';
import {
  MessageImagePrewiew,
  type MessageImagePrewiewProps,
} from './message-image-preview';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';
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
  message: UIMessage;
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: UseChatHelpers['setMessages'];
  reload: UseChatHelpers['reload'];
  isReadonly: boolean;
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const toggleEditMode = useCallback(() => setMode('edit'), []);

  return (
    <AnimatePresence>
      <motion.div
        className="group/message mx-auto w-full max-w-3xl px-4"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex w-full gap-4 group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ring-border">
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

          <div className="flex w-full flex-col gap-2">
            {message.experimental_attachments &&
              message.experimental_attachments.length > 0 && (
                <div className="flex flex-row justify-start gap-2">
                  {message.experimental_attachments.map(
                    (attachment, _, arr) => {
                      if (
                        arr.length === 1 &&
                        attachment.contentType &&
                        ALLOWED_IMAGE_MIME_TYPES.includes(
                          attachment.contentType as AllowedImageMimeTypes,
                        )
                      ) {
                        return (
                          <MessageImagePrewiew
                            key={attachment.url}
                            role={message.role}
                            url={attachment.url}
                            name={attachment.name ?? ''}
                            contentType={
                              attachment.contentType as MessageImagePrewiewProps['contentType']
                            }
                          />
                        );
                      }
                      return (
                        <PreviewAttachment
                          key={attachment.url}
                          attachment={attachment}
                        />
                      );
                    },
                  )}
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
                          ) : toolName === 'generateImage' ? (
                            <MessageImagePrewiew
                              role={message.role}
                              url={part.toolInvocation.result.image.url}
                              name={part.toolInvocation.result.image.name}
                              contentType={
                                part.toolInvocation.result.image.contentType
                              }
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
                          ) : toolName === 'generateImage' ? (
                            <div className="skeleton relative aspect-square max-w-[400px] overflow-hidden rounded-2xl">
                              <div className="relative h-full">
                                <div className="size-[400px] animate-pulse rounded-lg bg-muted-foreground/20" />
                              </div>
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
              <div className="flex flex-row items-start gap-2">
                <div className="prose flex max-w-none flex-col dark:prose-invert prose-p:mb-2 prose-ol:my-0">
                  <Markdown>{message.content as string}</Markdown>
                </div>
                {message.role === 'user' && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-fit rounded-full px-2 text-muted-foreground opacity-0 group-hover/message:opacity-100"
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
              <div className="flex flex-row items-start gap-2">
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
      className="group/message mx-auto w-full max-w-3xl px-4"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role="assistant"
    >
      <div
        className={cx(
          'flex w-full gap-4 rounded-xl group-data-[role=user]/message:ml-auto group-data-[role=user]/message:w-fit group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:px-3 group-data-[role=user]/message:py-2',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
