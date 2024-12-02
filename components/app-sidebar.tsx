"use client";

import { useRouter } from "next/navigation";

import { BetterTooltip } from "./better-tooltip";
import { PlusIcon } from "./icons";
import { SidebarHistory } from "./sidebar/history";
import { SidebarUserNav } from "./sidebar/user-nav";
import { Button } from "./ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from "./ui/sidebar";

import type { User } from "next-auth";

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setOpenMobile(false);
                router.push("/");
                router.refresh();
              }}
              className="flex flex-row items-center gap-3"
            >
              <span className="cursor-pointer rounded-md px-2 text-lg font-semibold hover:bg-muted">
                Chatbot
              </span>
            </button>
            <BetterTooltip content="New Chat" align="start">
              <Button
                variant="ghost"
                className="h-fit p-2"
                onClick={() => {
                  setOpenMobile(false);
                  router.push("/");
                  router.refresh();
                }}
              >
                <PlusIcon />
              </Button>
            </BetterTooltip>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarHistory user={user} />
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-0">
        {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarUserNav user={user} />
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
