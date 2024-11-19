import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { DEFAULT_MODEL_NAME, models } from "@/ai/models";
import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatByIdAndUserId, getMessagesByChatId } from "@/db/queries";
import { convertToUIMessages } from "@/lib/utils";

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
    chatId: params.id,
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
    <PreviewChat
      id={chat.id}
      initialMessages={convertToUIMessages(messagesFromDb ?? [])}
      selectedModelId={selectedModelId}
    />
  );
}
