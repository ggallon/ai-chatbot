'use client'

import { signOut } from '@auth/nextjs/client'
import type { Session } from '@auth/nextjs/types'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { IconExternalLink } from '@/components/ui/icons'

export interface UserMenuProps {
  user: Session['user']
}

function getUserInitials(name: string) {
  const [firstName, lastName] = name.split(' ')
  return lastName ? `${firstName[0]}${lastName[0]}` : firstName.slice(0, 2)
}

const githubImageLoader = ({ src, width }: { src: string; width: number }) => {
  return `${src}?w=${width}`
}

export function UserMenu({ user }: UserMenuProps) {
  return (
    <div className="flex items-center justify-between">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="pl-0">
            {user?.image ? (
              <Image
                className="h-6 w-6 select-none rounded-full ring-1 ring-zinc-100/10 transition-opacity duration-300 hover:opacity-80"
                loader={githubImageLoader}
                src={user?.image ?? ''}
                alt={user.name ?? 'Avatar'}
                width={24}
                height={24}
              />
            ) : (
              <div className="flex h-7 w-7 shrink-0 select-none items-center justify-center rounded-full bg-muted/50 text-xs font-medium uppercase text-muted-foreground">
                {user?.name ? getUserInitials(user?.name) : null}
              </div>
            )}
            <span className="ml-2 w-20 overflow-hidden text-ellipsis whitespace-nowrap md:w-full ">
              {user?.name}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent sideOffset={8} align="start" className="w-[180px]">
          <DropdownMenuItem className="flex-col items-start">
            <div className="text-xs font-medium">{user?.name}</div>
            <div className="text-xs text-zinc-500">{user?.email}</div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-between text-xs"
            >
              Vercel Homepage
              <IconExternalLink className="ml-auto h-3 w-3" />
            </a>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              signOut({
                callbackUrl: '/'
              })
            }
            className="text-xs"
          >
            Log Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
