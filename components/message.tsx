'use client';

import cx from 'classnames';
import equal from 'fast-deep-equal';
import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { memo, useCallback, useState } from 'react';

import { isAllowedTool } from '@/lib/ai/tools';
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
  const [fetchingImage, setFetchingImage] = useState(false);

  const download = useCallback(
    ({ url, name }: { url: string; name: string }) => {
      setFetchingImage(true);
      fetch(`${url}?download=1`)
        .then((response) => response.blob())
        .then((blob) => {
          setFetchingImage(false);
          const blobURL = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = blobURL;
          a.setAttribute('style', 'display: none');
          a.download = name;
          document.body.appendChild(a);
          a.click();
        })
        .catch((err) => console.log(err));
    },
    [],
  );

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
                          ) : toolName === 'generateImage' ? (
                            <div className="group/image relative aspect-square max-w-[400px] overflow-hidden rounded-2xl">
                              <div className="relative h-full">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  key={part.toolInvocation.toolCallId}
                                  className="w-fit opacity-100 transition-opacity duration-300"
                                  src={part.toolInvocation.result.image.url}
                                  alt={
                                    part.toolInvocation.result.image.url.name
                                  }
                                  height="1024"
                                  width="1024"
                                />
                                <div className="invisible absolute right-3 top-3 z-[2] flex gap-1 group-hover/image:visible">
                                  <button
                                    className="flex size-8 items-center justify-center rounded bg-black/50 hover:opacity-70"
                                    disabled={fetchingImage}
                                    onClick={() =>
                                      download({
                                        // @ts-expect-error -- fix me -- type tool result
                                        url: part.toolInvocation.result.image
                                          .url,
                                        // @ts-expect-error -- fix me -- type tool result
                                        name: part.toolInvocation.result.image
                                          .url.name,
                                      })
                                    }
                                  >
                                    <svg
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="text-white"
                                    >
                                      <path
                                        d="M7.70711 10.2929C7.31658 9.90237 6.68342 9.90237 6.29289 10.2929C5.90237 10.6834 5.90237 11.3166 6.29289 11.7071L11.2929 16.7071C11.6834 17.0976 12.3166 17.0976 12.7071 16.7071L17.7071 11.7071C18.0976 11.3166 18.0976 10.6834 17.7071 10.2929C17.3166 9.90237 16.6834 9.90237 16.2929 10.2929L13 13.5858L13 4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4L11 13.5858L7.70711 10.2929Z"
                                        fill="currentColor"
                                      ></path>
                                      <path
                                        d="M5 19C4.44772 19 4 19.4477 4 20C4 20.5523 4.44772 21 5 21H19C19.5523 21 20 20.5523 20 20C20 19.4477 19.5523 19 19 19L5 19Z"
                                        fill="currentColor"
                                      ></path>
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
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
