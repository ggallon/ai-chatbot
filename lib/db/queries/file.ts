import 'server-only';

import {
  list,
  type ListBlobResult,
  type ListBlobResultBlob,
} from '@vercel/blob';

import type { User } from '@/lib/db/schema';

export async function getFoldersByUserId({
  userId,
}: {
  userId: User['id'];
}): Promise<Array<string>> {
  try {
    const { folders } = await list({
      mode: 'folded',
      prefix: `AIChat/${userId}/`,
    });
    return folders;
  } catch (error) {
    console.error('Failed to get folders');
    throw error;
  }
}

export async function getUserImagesByUserId({
  userId,
}: {
  userId: User['id'];
}): Promise<Array<ListBlobResultBlob>> {
  try {
    const folders = await getFoldersByUserId({ userId });
    const allBlobs: Array<ListBlobResultBlob> = [];

    for (const folder of folders) {
      let hasMore = true;
      let cursor: string | undefined = undefined;

      while (hasMore) {
        const listResult: ListBlobResult = await list({
          prefix: folder,
          cursor,
        });

        allBlobs.push(...listResult.blobs);
        hasMore = listResult.hasMore;
        cursor = listResult.cursor;
      }
    }

    return allBlobs.sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
    );
  } catch (error) {
    console.error('Failed to get images in folder');
    throw error;
  }
}
