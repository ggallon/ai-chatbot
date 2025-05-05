'use client';

import { memo } from 'react';
import { useWindowSize } from 'usehooks-ts';

import { useSidebar } from '@/components/ui/sidebar';
import { ButtonNewChat } from './button-new-chat';
import { ModelSelector } from './model-selector';
import { SidebarToggle } from './sidebar-toggle';
import { VisibilitySelector } from './visibility-selector';

import type { ChatVisibility } from '@/lib/db/schema';

function PureChatHeader({
  chatId,
  selectedModelId,
  selectedVisibilityType,
  isReadonly,
}: {
  chatId: string;
  selectedModelId: string;
  selectedVisibilityType: ChatVisibility;
  isReadonly: boolean;
}) {
  const { open } = useSidebar();
  const { width: windowWidth } = useWindowSize();

  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5 md:px-2">
      <SidebarToggle />

      {(!open || windowWidth < 768) && <ButtonNewChat />}

      {!isReadonly && (
        <ModelSelector
          selectedModelId={selectedModelId}
          className="order-1 md:order-2"
        />
      )}

      {!isReadonly && (
        <VisibilitySelector
          chatId={chatId}
          selectedVisibilityType={selectedVisibilityType}
          className="order-1 md:order-3 md:ml-auto"
        />
      )}
    </header>
  );
}

export const ChatHeader = memo(PureChatHeader, (prevProps, nextProps) => {
  return prevProps.selectedModelId === nextProps.selectedModelId;
});
