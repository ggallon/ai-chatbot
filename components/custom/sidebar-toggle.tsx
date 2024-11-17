import { BetterTooltip } from "@/components/custom/better-tooltip";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { SidebarLeftIcon } from "./icons";

import type { ComponentProps } from "react";

export function SidebarToggle({
  className,
}: ComponentProps<typeof SidebarTrigger>) {
  const { toggleSidebar } = useSidebar();

  return (
    <BetterTooltip content="Toggle Sidebar" align="start">
      <Button
        onClick={toggleSidebar}
        variant="ghost"
        className={cn("md:h-fit md:px-2", className)}
      >
        <SidebarLeftIcon size={16} />
      </Button>
    </BetterTooltip>
  );
}
