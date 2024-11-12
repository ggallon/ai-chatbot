import { ComponentProps } from "react";

import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { BetterTooltip } from "@/components/custom/better-tooltip";
import { cn } from "@/lib/utils";

import { SidebarLeftIcon } from "./icons";
import { Button } from "../ui/button";

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
