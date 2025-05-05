'use client';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { PlusIcon } from './icons';

export function ButtonNewChat() {
  const router = useRouter();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          className="order-2 ml-auto md:order-1 md:ml-0"
          onClick={() => {
            router.push('/');
            router.refresh();
          }}
        >
          <PlusIcon />
          <span className="sr-only md:not-sr-only">New Chat</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>New Chat</TooltipContent>
    </Tooltip>
  );
}
