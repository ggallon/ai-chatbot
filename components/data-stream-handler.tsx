'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef, useState } from 'react';
import { useSWRConfig } from 'swr';

import { initialArtifactData, useArtifact } from '@/hooks/use-artifact';

import type { Chat, DocumentKind, Suggestion } from '@/lib/db/schema';

type DataStreamDelta =
  | {
      type:
        | 'id'
        | 'title'
        | 'code-delta'
        | 'image-delta'
        | 'sheet-delta'
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
  const { setArtifact } = useArtifact();
  const lastProcessedIndex = useRef(-1);
  const [optimisticSuggestions, setOptimisticSuggestions] = useState<
    Array<Suggestion>
  >([]);
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (optimisticSuggestions.length > 0) {
      const url = `/api/suggestions?documentId=${optimisticSuggestions[0].documentId}`;
      mutate(url, optimisticSuggestions, false);
    }
  }, [optimisticSuggestions, mutate]);

  useEffect(() => {
    if (!dataStream?.length) return;

    const newDeltas = dataStream.slice(lastProcessedIndex.current + 1);
    lastProcessedIndex.current = dataStream.length - 1;

    (newDeltas as DataStreamDelta[]).forEach((delta: DataStreamDelta) => {
      setArtifact((draftArtifact) => {
        if (!draftArtifact) {
          return { ...initialArtifactData, status: 'streaming' };
        }

        switch (delta.type) {
          case 'id':
            return {
              ...draftArtifact,
              documentId: delta.content,
              status: 'streaming',
            };

          case 'title':
            return {
              ...draftArtifact,
              title: delta.content,
              status: 'streaming',
            };

          case 'kind':
            return {
              ...draftArtifact,
              kind: delta.content,
              status: 'streaming',
            };

          case 'text-delta':
            return {
              ...draftArtifact,
              content: draftArtifact.content + delta.content,
              isVisible:
                draftArtifact.status === 'streaming' &&
                draftArtifact.content.length > 400 &&
                draftArtifact.content.length < 450
                  ? true
                  : draftArtifact.isVisible,
              status: 'streaming',
            };

          case 'sheet-delta':
            return {
              ...draftArtifact,
              content: draftArtifact.content + delta.content,
              isVisible:
                draftArtifact.status === 'streaming' &&
                draftArtifact.content.length > 400 &&
                draftArtifact.content.length < 450
                  ? true
                  : draftArtifact.isVisible,
              status: 'streaming',
            };

          case 'code-delta':
            return {
              ...draftArtifact,
              content: delta.content,
              isVisible:
                draftArtifact.status === 'streaming' &&
                draftArtifact.content.length > 300 &&
                draftArtifact.content.length < 310
                  ? true
                  : draftArtifact.isVisible,
              status: 'streaming',
            };

          case 'image-delta':
            return {
              ...draftArtifact,
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

            return draftArtifact;

          case 'clear':
            return {
              ...draftArtifact,
              content: '',
              status: 'streaming',
            };

          case 'finish':
            return {
              ...draftArtifact,
              status: 'idle',
            };

          default:
            return draftArtifact;
        }
      });
    });
  }, [dataStream, setArtifact]);

  return null;
}
