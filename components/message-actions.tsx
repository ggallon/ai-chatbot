import equal from 'fast-deep-equal';
import { memo, useCallback } from 'react';
import { toast } from 'sonner';
import { useSWRConfig } from 'swr';
import { useCopyToClipboard } from 'usehooks-ts';

import { CopyIcon, ThumbDownIcon, ThumbUpIcon } from './icons';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from './ui/tooltip';

import type { UIMessage } from 'ai';
import type { Vote } from '@/lib/db/schema';

function PureMessageActions({
  chatId,
  messageId,
  messageContent,
  vote,
}: {
  chatId: string;
  messageId: UIMessage['id'];
  messageContent: UIMessage['content'];
  vote: Vote | undefined;
}) {
  const [_, copyToClipboard] = useCopyToClipboard();
  const { mutate } = useSWRConfig();

  const setVote = useCallback(
    (type: 'down' | 'up') =>
      fetch('/api/vote', {
        method: 'PATCH',
        body: JSON.stringify({
          chatId,
          messageId,
          type,
        }),
      }),
    [chatId, messageId],
  );

  const mutateVote = useCallback(
    (isUpvoted: boolean) =>
      mutate<Array<Vote>>(
        `/api/vote?chatId=${chatId}`,
        (currentVotes) => {
          if (!currentVotes) return [];

          const votesWithoutCurrent = currentVotes.filter(
            (vote) => vote.messageId !== messageId,
          );

          return [
            ...votesWithoutCurrent,
            {
              chatId,
              messageId,
              isUpvoted,
            },
          ];
        },
        { revalidate: false },
      ),
    [chatId, messageId, mutate],
  );

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-row gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-fit px-2 py-1 text-muted-foreground"
              variant="outline"
              onClick={async () => {
                await copyToClipboard(messageContent);
                toast.success('Copied to clipboard!');
              }}
            >
              <CopyIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="pointer-events-auto! h-fit px-2 py-1 text-muted-foreground"
              disabled={vote?.isUpvoted}
              variant="outline"
              onClick={async () => {
                toast.promise(setVote('up'), {
                  loading: 'Upvoting Response...',
                  success: () => {
                    mutateVote(true);
                    return 'Upvoted Response!';
                  },
                  error: 'Failed to upvote response.',
                });
              }}
            >
              <ThumbUpIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Upvote Response</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="pointer-events-auto! h-fit px-2 py-1 text-muted-foreground"
              variant="outline"
              disabled={vote && !vote.isUpvoted}
              onClick={async () => {
                toast.promise(setVote('down'), {
                  loading: 'Downvoting Response...',
                  success: () => {
                    mutateVote(false);
                    return 'Downvoted Response!';
                  },
                  error: 'Failed to downvote response.',
                });
              }}
            >
              <ThumbDownIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Downvote Response</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

export const MessageActions = memo(
  PureMessageActions,
  (prevProps, nextProps) => {
    if (prevProps.messageContent !== nextProps.messageContent) return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;

    return true;
  },
);
