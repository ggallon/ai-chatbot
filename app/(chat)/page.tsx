import { redirect } from 'next/navigation';

import { auth } from '@/app/(auth)/auth';
import { Chat } from '@/components/chat';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { getSelectedModelId } from '@/lib/utils/get-selected-model-id';
import { generateUUID } from '@/lib/utils/uuid';

export default async function Page() {
  const id = generateUUID();
  const [session, selectedModelId] = await Promise.all([
    auth(),
    getSelectedModelId(),
  ]);

  if (!session?.user?.id) {
    redirect('/login');
  }

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        selectedModelId={selectedModelId}
        selectedVisibilityType="private"
        isReadonly={false}
      />
      <DataStreamHandler id={id} />
    </>
  );
}
