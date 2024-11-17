import { cookies } from "next/headers";
import { notFound } from "next/navigation";

import { DEFAULT_MODEL_NAME, models } from "@/ai/models";
import { auth } from "@/app/(auth)/auth";
import { Chat as PreviewChat } from "@/components/custom/chat";
import { getChatById, getMessagesByChatId } from "@/db/queries";
import { convertToUIMessages } from "@/lib/utils";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const [session, cookieStore] = await Promise.all([auth(), cookies()]);
  if (!session?.user?.id) {
    notFound();
  }

  const chat = await getChatById({ id: params.id });
  if (!chat) {
    notFound();
  }

  if (session.user.id !== chat.userId) {
    notFound();
  }

  const messagesFromDb = await getMessagesByChatId({ id: params.id });
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
