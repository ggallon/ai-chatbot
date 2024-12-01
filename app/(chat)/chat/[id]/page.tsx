import { notFound } from "next/navigation";

import { convertToUIMessages } from "@/ai/utils";
import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { getChatByIdAndUserId } from "@/db/queries/chat";
import { getSelectedModelId } from "@/lib/utils/get-selected-model-id";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page(props: PageProps) {
  const [session, selectedModelId, params] = await Promise.all([
    auth(),
    getSelectedModelId(),
    props.params,
  ]);
  if (!session?.user?.id) {
    notFound();
  }

  const chat = await getChatByIdAndUserId({
    id: params.id,
    userId: session.user.id,
    withMessages: true,
  });
  if (!chat) {
    notFound();
  }

  return (
    <Chat
      id={chat.id}
      initialMessages={convertToUIMessages(
        "messages" in chat ? chat.messages : []
      )}
      selectedModelId={selectedModelId}
    />
  );
}
