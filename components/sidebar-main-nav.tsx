'use client';

import { Images } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from '@/components/ui/sidebar';

import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function SideBarNavMain() {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <SidebarMenu>
      <div className="flex flex-row items-center justify-between">
        <Link
          href="/"
          onClick={() => {
            setOpenMobile(false);
          }}
          className="flex flex-row items-center gap-3"
        >
          <span className="cursor-pointer rounded-md px-2 text-lg font-semibold hover:bg-muted">
            Chatbot
          </span>
        </Link>
        <Tooltip delayDuration={900}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              type="button"
              size="icon"
              onClick={() => {
                setOpenMobile(false);
                router.push('/');
                router.refresh();
              }}
            >
              <PlusIcon />
            </Button>
          </TooltipTrigger>
          <TooltipContent align="end">New Chat</TooltipContent>
        </Tooltip>
      </div>
    </SidebarMenu>
  );
}
