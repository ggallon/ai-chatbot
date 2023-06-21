import { SidebarActions } from '@/components/sidebar-actions'
import { SidebarItem } from '@/components/sidebar-item'
import { getChats, removeChat, shareChat } from '@/app/actions'

export interface SlideoverListProps {
  userId?: string
}

export async function SlideoversList({ userId }: SlideoverListProps) {
  const chats = await getChats(userId)

  return (
    <ul role="list" className="flex-1 space-y-2 overflow-y-auto px-2">
      {chats?.length ? (
        chats.map(
          chat =>
            chat && (
              <SidebarItem key={chat?.id} chat={chat}>
                <SidebarActions
                  chat={chat}
                  removeChat={removeChat}
                  shareChat={shareChat}
                />
              </SidebarItem>
            )
        )
      ) : (
        <li className="p-8 text-center">
          <p className="text-sm text-muted-foreground">No chat history</p>
        </li>
      )}
    </ul>
  )
}
