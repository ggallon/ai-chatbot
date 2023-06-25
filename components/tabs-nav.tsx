'use client'

import { clsx } from 'clsx'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function TabsNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-1 items-center justify-start">
      <ul className="flex select-none list-none items-center justify-between rounded-lg bg-zinc-200/60 p-[2px] text-sm font-semibold leading-4">
        <TabsNavItem isActive={pathname === '/'} href="/">
          Chat
        </TabsNavItem>
        <TabsNavItem isActive={pathname === '/limit'} href="/limit">
          Prompt
        </TabsNavItem>
        <TabsNavItem isActive={pathname === '/write'} href="/write">
          Write
        </TabsNavItem>
      </ul>
    </nav>
  )
}

export function TabsNavItem({ children, isActive, href }) {
  return (
    <li
      className={clsx(
        'relative sm:rounded-md',
        isActive
          ? 'cursor-default text-black'
          : 'text-zinc-600 hover:text-zinc-900'
      )}
    >
      {isActive && (
        <div className="absolute inset-0 bg-white shadow sm:rounded-md" />
      )}
      <Link
        className="no-drag relative z-10 block px-2 py-1 sm:px-3 sm:py-1.5"
        href={href}
      >
        {children}
      </Link>
    </li>
  )
}
