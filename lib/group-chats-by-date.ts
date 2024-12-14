import { isToday, isYesterday, subMonths, subWeeks } from 'date-fns';
import type { Chat } from '@/lib/db/schema';

interface GroupedChats {
  today: Chat[];
  yesterday: Chat[];
  lastWeek: Chat[];
  lastMonth: Chat[];
  older: Chat[];
}

/**
 * Groups chats into categories based on their creation date.
 *
 * @param {Chat[]} chats - The list of chat objects to group.
 * @returns {GroupedChats} An object containing chats grouped by date categories.
 */
export function groupChatsByDate(chats: Chat[]): GroupedChats {
  const now = new Date();
  const oneWeekAgo = subWeeks(now, 1);
  const oneMonthAgo = subMonths(now, 1);

  // Initialize grouped chats
  const groupedChats: GroupedChats = {
    today: [],
    yesterday: [],
    lastWeek: [],
    lastMonth: [],
    older: [],
  };

  /**
   * Determines the category of a chat based on its creation date.
   *
   * @param {Date} chatDate - The creation date of the chat.
   * @returns {keyof GroupedChats} The category key for the chat.
   */
  const getCategory = (chatDate: Date): keyof GroupedChats => {
    if (isToday(chatDate)) return 'today';
    if (isYesterday(chatDate)) return 'yesterday';
    if (chatDate > oneWeekAgo) return 'lastWeek';
    if (chatDate > oneMonthAgo) return 'lastMonth';
    return 'older';
  };

  // Group chats
  for (const chat of chats) {
    const category = getCategory(new Date(chat.createdAt));
    groupedChats[category].push(chat);
  }

  return groupedChats;
}
