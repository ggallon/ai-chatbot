import { cn } from "@/lib/utils/cn";

import { BetterTooltip } from "@/components/better-tooltip";
import { SidebarLeftIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function SidebarToggle({
  className,
}: React.ComponentProps<typeof SidebarTrigger>) {
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
