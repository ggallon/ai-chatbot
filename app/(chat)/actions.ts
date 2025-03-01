'use server';

import { cookies } from 'next/headers';

import { updateChatVisibilityById } from '@/lib/db/queries/chat';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
} from '@/lib/db/queries/message';

import type { Chat } from '@/lib/db/schema';

export async function saveModelId(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('model-id', model);
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const message = await getMessageById({ id });
  if (message) {
    await deleteMessagesByChatIdAfterTimestamp({
      chatId: message.chatId,
      timestamp: message.createdAt,
    });
  }
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: Chat['visibility'];
}) {
  await updateChatVisibilityById({ chatId, visibility });
}
