'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';

import { initialBlockData, useBlock } from '@/hooks/use-block';

import type { Chat, DocumentKind, Suggestion } from '@/lib/db/schema';

type DataStreamDelta =
  | {
      type:
        | 'id'
        | 'title'
        | 'code-delta'
        | 'image-delta'
        | 'text-delta'
        | 'clear'
        | 'finish';
      content: string;
    }
  | {
      type: 'kind';
      content: DocumentKind;
    }
  | {
      type: 'suggestion';
      content: Suggestion;
    };

export function DataStreamHandler({ id }: { id: Chat['id'] }) {
  const { data: dataStream } = useChat({ id });
  const { setBlock } = useBlock();
  const lastProcessedIndex = useRef(-1);
  const [optimisticSuggestions, setOptimisticSuggestions] = useState<
    Array<Suggestion>
  >([]);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (optimisticSuggestions && optimisticSuggestions.length > 0) {
      const [optimisticSuggestion] = optimisticSuggestions;
      const url = `/api/suggestions?documentId=${optimisticSuggestion.documentId}`;
      mutate(url, optimisticSuggestions, false);
    }
  }, [optimisticSuggestions, mutate]);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
      setBlock((draftBlock) => {
        if (!draftBlock) {
          return { ...initialBlockData, status: 'streaming' };
        }

        switch (delta.type) {
          case 'id':
            return {
              ...draftBlock,
              documentId: delta.content,
              status: 'streaming',
            };

          case 'title':
            return {
              ...draftBlock,
              title: delta.content,
              status: 'streaming',
            };

          case 'kind':
            return {
              ...draftBlock,
              kind: delta.content,
              status: 'streaming',
            };

          case 'text-delta':
            return {
              ...draftBlock,
              content: draftBlock.content + delta.content,
              isVisible:
                draftBlock.status === 'streaming' &&
                draftBlock.content.length > 400 &&
                draftBlock.content.length < 450
                  ? true
                  : draftBlock.isVisible,
              status: 'streaming',
            };

          case 'code-delta':
            return {
              ...draftBlock,
              content: delta.content,
              isVisible:
                draftBlock.status === 'streaming' &&
                draftBlock.content.length > 300 &&
                draftBlock.content.length < 310
                  ? true
                  : draftBlock.isVisible,
              status: 'streaming',
            };

          case 'image-delta':
            return {
              ...draftBlock,
              content: delta.content,
              isVisible: true,
              status: 'streaming',
            };

          case 'suggestion':
            setTimeout(() => {
              setOptimisticSuggestions((currentSuggestions) => [
                ...currentSuggestions,
                delta.content,
              ]);
            }, 0);

            return draftBlock;

          case 'clear':
            return {
              ...draftBlock,
              content: '',
              status: 'streaming',
            };

          case 'finish':
            return {
              ...draftBlock,
              status: 'idle',
            };

          default:
            return draftBlock;
        }
      });
    });
  }, [dataStream, setBlock]);

  return null;
}
