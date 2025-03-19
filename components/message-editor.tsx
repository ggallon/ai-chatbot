'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';

import { deleteTrailingMessages } from '@/app/(chat)/actions';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';

import type { UseChatHelpers } from '@ai-sdk/react';
import type { UIMessage } from 'ai';

export type MessageEditorProps = {
  message: UIMessage;
  setMessages: UseChatHelpers['setMessages'];
  setMode: Dispatch<SetStateAction<'view' | 'edit'>>;
  reload: UseChatHelpers['reload'];
};

export function MessageEditor({
  message,
  setMessages,
  setMode,
  reload,
}: MessageEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draftContent, setDraftContent] = useState(message.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${String(textareaRef.current.scrollHeight + 2)}px`;
    }
  };

  const handleInput = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDraftContent(event.target.value);
    adjustHeight();
  };

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  return (
    <div className="flex w-full flex-col gap-2">
      <Textarea
        ref={textareaRef}
        className="w-full resize-none overflow-hidden rounded-xl bg-transparent text-base! outline-hidden"
        value={draftContent}
        onChange={handleInput}
      />

      <div className="flex flex-row justify-end gap-2">
        <Button
          variant="outline"
          className="h-fit px-3 py-2"
          onClick={() => {
            setMode('view');
          }}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          className="h-fit px-3 py-2"
          disabled={isSubmitting}
          onClick={async () => {
            setIsSubmitting(true);

            await deleteTrailingMessages({ id: message.id });

            setMessages((messages) => {
              const index = messages.findIndex((m) => m.id === message.id);

              if (index !== -1) {
                return [
                  ...messages.slice(0, index),
                  {
                    ...message,
                    content: draftContent,
                  },
                ];
              }

              return messages;
            });

            setMode('view');
            reload();
          }}
        >
          {isSubmitting ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
}
