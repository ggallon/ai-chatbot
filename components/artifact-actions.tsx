import { memo } from 'react';
import { toast } from 'sonner';

import { useMultimodalCopyToClipboard } from '@/hooks/use-multimodal-copy-to-clipboard';
import { cn } from '@/lib/utils/cn';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { CopyIcon, ClockRewind, RedoIcon, UndoIcon } from './icons';

import type { UIArtifact } from './artifact';

interface ArtifactActionsProps {
  artifact: UIArtifact;
  handleVersionChange: (type: 'next' | 'prev' | 'toggle' | 'latest') => void;
  currentVersionIndex: number;
  isCurrentVersion: boolean;
  mode: 'read-only' | 'edit' | 'diff';
}

function PureArtifactActions({
  artifact,
  handleVersionChange,
  currentVersionIndex,
  isCurrentVersion,
  mode,
}: ArtifactActionsProps) {
  const { copyTextToClipboard, copyImageToClipboard } =
    useMultimodalCopyToClipboard();

  return (
    <div className="flex flex-row gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn({
              'bg-muted': mode === 'diff',
            })}
            onClick={() => {
              handleVersionChange('toggle');
            }}
            disabled={
              artifact.status === 'streaming' || currentVersionIndex === 0
            }
          >
            <ClockRewind size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View changes</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              handleVersionChange('prev');
            }}
            disabled={
              currentVersionIndex === 0 || artifact.status === 'streaming'
            }
          >
            <UndoIcon size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View Previous version</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              handleVersionChange('next');
            }}
            disabled={isCurrentVersion || artifact.status === 'streaming'}
          >
            <RedoIcon size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>View Next version</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              if (artifact.kind === 'image') {
                copyImageToClipboard(artifact.content);
              } else {
                copyTextToClipboard(artifact.content);
              }

              toast.success('Copied to clipboard!');
            }}
            disabled={artifact.status === 'streaming'}
          >
            <CopyIcon size={18} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Copy to clipboard</TooltipContent>
      </Tooltip>
    </div>
  );
}

export const ArtifactActions = memo(
  PureArtifactActions,
  (prevProps, nextProps) => {
    if (prevProps.artifact.status !== nextProps.artifact.status) return false;
    if (prevProps.currentVersionIndex !== nextProps.currentVersionIndex)
      return false;
    if (prevProps.isCurrentVersion !== nextProps.isCurrentVersion) return false;
    if (prevProps.artifact.content !== nextProps.artifact.content) return false;

    return true;
  },
);
