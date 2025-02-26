'use client';

import equal from 'fast-deep-equal';
import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  type MouseEvent,
  type RefObject,
} from 'react';
import useSWR from 'swr';

import { useArtifact } from '@/hooks/use-artifact';
import { cn } from '@/lib/utils/cn';
import { fetcher } from '@/lib/utils/fetcher';

import { DocumentToolCall, DocumentToolResult } from './document';
import { InlineDocumentSkeleton } from './document-skeleton';
import { Editor } from './editor';
import { FileIcon, FullscreenIcon, ImageIcon, LoaderIcon } from './icons';
import { ImageEditor } from './image-editor';

import type { Document, DocumentKind } from '@/lib/db/schema';
import type { UIArtifact } from './artifact';

interface DocumentPreviewProps {
  isReadonly: boolean;
  result?: any;
  args?: any;
}

export function DocumentPreview({
  isReadonly,
  result,
  args,
}: DocumentPreviewProps) {
  const { artifact, setArtifact } = useArtifact();

  const { data: documents, isLoading: isDocumentsFetching } = useSWR<
    Array<Document>
  >(result ? `/api/document?id=${result.id}` : null, fetcher);

  const previewDocument = useMemo(() => documents?.[0], [documents]);
  const hitboxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const boundingBox = hitboxRef.current?.getBoundingClientRect();
    if (artifact.documentId && boundingBox) {
      setArtifact((artifact) => ({
        ...artifact,
        boundingBox: {
          left: boundingBox.x,
          top: boundingBox.y,
          width: boundingBox.width,
          height: boundingBox.height,
        },
      }));
    }
  }, [artifact.documentId, setArtifact]);

  if (artifact.isVisible) {
    if (result) {
      return (
        <DocumentToolResult
          type="createDocument"
          result={{ id: result.id, title: result.title, kind: result.kind }}
          isReadonly={isReadonly}
        />
      );
    }

    if (args) {
      return (
        <DocumentToolCall
          type="createDocument"
          args={{ title: args.title }}
          isReadonly={isReadonly}
        />
      );
    }
  }

  if (isDocumentsFetching) {
    return <LoadingSkeleton artifactKind={result.kind ?? args.kind} />;
  }

  const document: Document | null = previewDocument
    ? previewDocument
    : artifact.status === 'streaming'
      ? {
          title: artifact.title,
          kind: artifact.kind,
          content: artifact.content,
          id: artifact.documentId,
          createdAt: new Date(),
          userId: 'noop',
        }
      : null;

  if (!document) return <LoadingSkeleton artifactKind={artifact.kind} />;

  return (
    <div className="relative w-full cursor-pointer">
      <HitboxLayer
        hitboxRef={hitboxRef as RefObject<HTMLDivElement>}
        result={result}
        setArtifact={setArtifact}
      />
      <DocumentHeader
        title={document.title}
        kind={document.kind}
        isStreaming={artifact.status === 'streaming'}
      />
      <DocumentContent document={document} />
    </div>
  );
}

const LoadingSkeleton = ({ artifactKind }: { artifactKind: DocumentKind }) => (
  <div className="w-full">
    <div className="flex h-[57px] flex-row items-center justify-between gap-2 rounded-t-2xl border border-b-0 p-4 dark:border-zinc-700 dark:bg-muted">
      <div className="flex flex-row items-center gap-3">
        <div className="text-muted-foreground">
          <div className="size-4 animate-pulse rounded-md bg-muted-foreground/20" />
        </div>
        <div className="h-4 w-24 animate-pulse rounded-lg bg-muted-foreground/20" />
      </div>
      <div>
        <FullscreenIcon />
      </div>
    </div>
    {artifactKind === 'image' ? (
      <div className="overflow-y-scroll rounded-b-2xl border border-t-0 bg-muted dark:border-zinc-700">
        <div className="h-[257px] w-full animate-pulse bg-muted-foreground/20" />
      </div>
    ) : (
      <div className="overflow-y-scroll rounded-b-2xl border border-t-0 bg-muted p-8 pt-4 dark:border-zinc-700">
        <InlineDocumentSkeleton />
      </div>
    )}
  </div>
);

const PureHitboxLayer = ({
  hitboxRef,
  result,
  setArtifact,
}: {
  hitboxRef: React.RefObject<HTMLDivElement>;
  result: any;
  setArtifact: (
    updaterFn: UIArtifact | ((currentArtifact: UIArtifact) => UIArtifact),
  ) => void;
}) => {
  const handleClick = useCallback(
    (event: MouseEvent<HTMLElement>) => {
      const boundingBox = event.currentTarget.getBoundingClientRect();

      setArtifact((artifact) =>
        artifact.status === 'streaming'
          ? { ...artifact, isVisible: true }
          : {
              ...artifact,
              title: result.title,
              documentId: result.id,
              kind: result.kind,
              isVisible: true,
              boundingBox: {
                left: boundingBox.x,
                top: boundingBox.y,
                width: boundingBox.width,
                height: boundingBox.height,
              },
            },
      );
    },
    [setArtifact, result],
  );

  return (
    <div
      className="absolute left-0 top-0 z-10 size-full rounded-xl"
      ref={hitboxRef}
      onClick={handleClick}
      role="presentation"
      aria-hidden="true"
    >
      <div className="flex w-full items-center justify-end p-4">
        <div className="absolute right-[9px] top-[13px] rounded-md p-2 hover:bg-zinc-100 hover:dark:bg-zinc-700">
          <FullscreenIcon />
        </div>
      </div>
    </div>
  );
};

const HitboxLayer = memo(PureHitboxLayer, (prevProps, nextProps) => {
  if (!equal(prevProps.result, nextProps.result)) return false;
  return true;
});

const PureDocumentHeader = ({
  title,
  kind,
  isStreaming,
}: {
  title: string;
  kind: DocumentKind;
  isStreaming: boolean;
}) => (
  <div className="flex flex-row items-start justify-between gap-2 rounded-t-2xl border border-b-0 p-4 dark:border-zinc-700 dark:bg-muted sm:items-center">
    <div className="flex flex-row items-start gap-3 sm:items-center">
      <div className="text-muted-foreground">
        {isStreaming ? (
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        ) : kind === 'image' ? (
          <ImageIcon />
        ) : (
          <FileIcon />
        )}
      </div>
      <div className="-translate-y-1 font-medium sm:translate-y-0">{title}</div>
    </div>
    <div className="w-8" />
  </div>
);

const DocumentHeader = memo(PureDocumentHeader, (prevProps, nextProps) => {
  if (prevProps.kind !== nextProps.kind) return false;
  if (prevProps.title !== nextProps.title) return false;
  if (prevProps.isStreaming !== nextProps.isStreaming) return false;

  return true;
});

const DocumentContent = ({ document }: { document: Document }) => {
  const { artifact } = useArtifact();

  const containerClassName = cn(
    'h-[257px] overflow-y-scroll rounded-b-2xl border border-t-0 dark:border-zinc-700 dark:bg-muted',
    {
      'p-4 sm:px-14 sm:py-16': document.kind === 'text',
      'p-0': document.kind === 'code',
    },
  );

  const commonProps = {
    content: document.content ?? '',
    isCurrentVersion: true,
    currentVersionIndex: 0,
    status: artifact.status,
    onSaveContent: () => {},
    suggestions: [],
  };

  return (
    <div className={containerClassName}>
      {document.kind === 'text' ? (
        <Editor {...commonProps} />
      ) : document.kind === 'image' ? (
        <ImageEditor
          title={document.title}
          content={document.content ?? ''}
          isCurrentVersion={true}
          currentVersionIndex={0}
          status={artifact.status}
          isInline={true}
        />
      ) : null}
    </div>
  );
};
