'use client';

import { SidebarHistory } from './sidebar-history';
import { SideBarNavMain } from './sidebar-main-nav';
import { SidebarUserNav } from './sidebar-user-nav';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from './ui/sidebar';

import type { User } from 'next-auth';

export function AppSidebar({ user }: { user?: User }) {
  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SideBarNavMain />
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
