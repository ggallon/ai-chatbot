import Link from 'next/link'
import * as React from 'react'

import { buttonVariants } from '@/components/ui/button'
import {
  IconGitHub,
  IconNextChat,
  IconSeparator,
  IconVercel
} from '@/components/ui/icons'
import { ClearHistory } from '@/components/clear-history'
import { LoginButton } from '@/components/login-button'
import { SidebarFooter } from '@/components/sidebar-footer'
import SildeOver from '@/components/slideOvers'
import { SlideoverList, SlideoversList } from '@/components/slideovers-list'
import { ThemeToggle } from '@/components/theme-toggle'
import { UserMenu } from '@/components/user-menu'
import { clearChats } from '@/app/actions'
import { auth } from '@/auth'
import { cn } from '@/lib/utils'

export async function Header() {
  const session = await auth()
  return (
    <header className="sticky top-0 z-50 flex h-16 w-full shrink-0 items-center justify-between border-b bg-gradient-to-b from-background/10 via-background/50 to-background/80 px-4 backdrop-blur-xl">
      <div className="flex items-center">
        {session?.user ? (
          <SildeOver>
            <React.Suspense
              fallback={<ul role="list" className="flex-1 overflow-y-auto" />}
            >
              <SlideoversList userId={session?.user?.id} />
            </React.Suspense>
            <SidebarFooter>
              <ThemeToggle />
              <ClearHistory clearChats={clearChats} />
            </SidebarFooter>
          </SildeOver>
        ) : (
          <Link href="/" target="_blank" rel="nofollow">
            <IconNextChat className="mr-2 h-6 w-6 dark:hidden" inverted />
            <IconNextChat className="mr-2 hidden h-6 w-6 dark:block" />
          </Link>
        )}
        <div className="flex items-center">
          <IconSeparator className="h-6 w-6 text-muted-foreground/50" />
          {session?.user ? (
            <UserMenu user={session.user} />
          ) : (
            <LoginButton
              variant="link"
              showGithubIcon={false}
              text="Login"
              className="-ml-2"
            />
          )}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <a
          target="_blank"
          href="https://github.com/vercel/nextjs-ai-chatbot/"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          <IconGitHub />
          <span className="ml-2 hidden md:flex">GitHub</span>
        </a>
        <a
          href="https://github.com/vercel/nextjs-ai-chatbot/"
          target="_blank"
          className={cn(buttonVariants())}
        >
          <IconVercel className="mr-2" />
          <span className="hidden sm:block">Deploy to Vercel</span>
          <span className="sm:hidden">Deploy</span>
        </a>
      </div>
    </header>
  )
}
