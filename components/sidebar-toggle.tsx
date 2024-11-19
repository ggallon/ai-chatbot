import { cn } from "@/lib/utils";

import { BetterTooltip } from "./better-tooltip";
import { SidebarLeftIcon } from "./icons";
import { Button } from "./ui/button";
import { SidebarTrigger, useSidebar } from "./ui/sidebar";

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
