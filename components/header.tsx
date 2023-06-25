import Link from 'next/link'
import * as React from 'react'

import { Button, buttonVariants } from '@/components/ui/button'
import { IconAi, IconProactice, IconSeparator } from '@/components/ui/icons'
import { ClearHistory } from '@/components/clear-history'
import { Sidebar } from '@/components/sidebar'
import { SidebarFooter } from '@/components/sidebar-footer'
import { SidebarList } from '@/components/sidebar-list'
import { TabsNav } from '@/components/tabs-nav'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { clearChats } from '@/app/actions'
import { auth } from '@/auth'
import { cn } from '@/lib/utils/ui'

export async function Header() {
  const session = await auth()
  return (
    <header className="sticky top-0 z-50 flex h-11 w-full shrink-0 items-center justify-between gap-3 border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl sm:gap-3.5">
      <div className="ai-effect inline-flex select-none items-center whitespace-nowrap">
        {session?.user ? (
          <Sidebar>
            <React.Suspense fallback={<div className="flex-1 overflow-auto" />}>
              <SidebarList userId={session?.user?.id} />
            </React.Suspense>
            <SidebarFooter className="absolute inset-x-0 bottom-0">
              <ThemeToggle />
              <ClearHistory clearChats={clearChats} />
            </SidebarFooter>
          </Sidebar>
        ) : (
          <Link href="/" target="_blank" rel="nofollow">
            <IconProactice className="h-6 w-6" />
          </Link>
        )}
        <IconSeparator className="-mr-1 h-6 w-6 text-muted-foreground/50" />
        <Link href="/">
          <span className="font-bold lg:text-lg">
            <IconAi className="mb-0.5 mr-0 inline w-4 text-black text-foreground sm:w-5" />
            AI
          </span>
        </Link>
      </div>
      <TabsNav />
      <div className="flex items-center justify-end space-x-2">
        {session?.user ? (
          <UserMenu user={session.user} />
        ) : (
          <Button variant="link" asChild className="-ml-2">
            <Link href="/sign-in">Login</Link>
          </Button>
        )}
      </div>
    </header>
  )
}
