import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { DEFAULT_MODEL_NAME, models } from "@/ai/models";
import { convertToUIMessages } from "@/ai/utils";
import { auth } from "@/app/(auth)/auth";
import { Chat } from "@/components/chat";
import { getChatByIdAndUserId } from "@/db/queries/chat";
import { getMessagesByChatId } from "@/db/queries/message";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page(props: PageProps) {
  const [session, cookieStore, params] = await Promise.all([
    auth(),
    cookies(),
    props.params,
  ]);
  if (!session?.user?.id) {
    notFound();
  }

  const chat = await getChatByIdAndUserId({
    id: params.id,
    userId: session.user.id,
  });
  if (!chat) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id: chat.id });
  const modelIdFromCookie = cookieStore.get("model-id")?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;

  return (
    <Chat
      id={chat.id}
      initialMessages={convertToUIMessages(messagesFromDb ?? [])}
      selectedModelId={selectedModelId}
    />
  );
}
