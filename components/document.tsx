import { memo } from 'react';
import { toast } from 'sonner';

import { useArtifact } from '@/hooks/use-artifact';

import { FileIcon, LoaderIcon, MessageIcon, PencilEditIcon } from './icons';

import type { DocumentTools } from '@/lib/ai/tools';
import type { DocumentKind } from '@/lib/db/schema';

const actionIconMap: Record<DocumentTools, React.JSX.Element> = {
  createDocument: <FileIcon />,
  updateDocument: <PencilEditIcon />,
  requestSuggestions: <MessageIcon />,
};

const actionTextMap: Record<DocumentTools, { present: string; past: string }> =
  {
    createDocument: { present: 'Creating', past: 'Created' },
    updateDocument: { present: 'Updating', past: 'Updated' },
    requestSuggestions: {
      present: 'Adding suggestions',
      past: 'Added suggestions to',
    },
  };

const getActionText = (type: DocumentTools, tense: 'present' | 'past') =>
  actionTextMap[type][tense];

interface DocumentToolResultProps {
  type: DocumentTools;
  result: { id: string; title: string; kind: DocumentKind };
  isReadonly: boolean;
}

function PureDocumentToolResult({
  type,
  result,
  isReadonly,
}: DocumentToolResultProps) {
  const { setArtifact } = useArtifact();

  return (
    <button
      type="button"
      className="flex w-fit cursor-pointer flex-row items-start gap-3 rounded-xl border bg-background px-3 py-2"
      onClick={(event) => {
        if (isReadonly) {
          toast.error(
            'Viewing files in shared chats is currently not supported.',
          );
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        const boundingBox = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };

        setArtifact({
          documentId: result.id,
          kind: result.kind,
          content: '',
          title: result.title,
          isVisible: true,
          status: 'idle',
          boundingBox,
        });
      }}
    >
      <div className="mt-1 text-muted-foreground">{actionIconMap[type]}</div>
      <div className="text-left">
        {`${getActionText(type, 'past')} "${result.title}"`}
      </div>
    </button>
  );
}

export const DocumentToolResult = memo(PureDocumentToolResult, () => true);

interface DocumentToolCallProps {
  type: DocumentTools;
  args: { title: string };
  isReadonly: boolean;
}

function PureDocumentToolCall({
  type,
  args,
  isReadonly,
}: DocumentToolCallProps) {
  const { setArtifact } = useArtifact();

  return (
    <button
      type="button"
      className="flex w-fit cursor-pointer flex-row items-start justify-between gap-3 rounded-xl border px-3 py-2"
      onClick={(event) => {
        if (isReadonly) {
          toast.error(
            'Viewing files in shared chats is currently not supported.',
          );
          return;
        }

        const rect = event.currentTarget.getBoundingClientRect();

        const boundingBox = {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        };

        setArtifact((currentArtifact) => ({
          ...currentArtifact,
          isVisible: true,
          boundingBox,
        }));
      }}
    >
      <div className="flex flex-row items-start gap-3">
        <div className="mt-1 text-zinc-500">{actionIconMap[type]}</div>

        <div className="text-left">
          {`${getActionText(type, 'present')} ${args.title ? `"${args.title}"` : ''}`}
        </div>
      </div>

      <div className="mt-1 animate-spin">{<LoaderIcon />}</div>
    </button>
  );
}

export const DocumentToolCall = memo(PureDocumentToolCall, () => true);
