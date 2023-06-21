import { cn } from '@/lib/utils'

export function SidebarFooter({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'flex flex-shrink-0 items-center justify-between p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
