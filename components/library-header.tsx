import { SidebarToggle } from './sidebar-toggle';
import { ButtonNewChat } from './button-new-chat';

export function LibrayHeader() {
  return (
    <header className="sticky top-0 flex items-center gap-2 bg-background px-2 py-1.5">
      <SidebarToggle />
      <ButtonNewChat />
    </header>
  );
}
