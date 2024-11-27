import { auth } from "@/app/(auth)/auth";
import { voteMessage, type VoteMesage } from "@/db/queries/vote";

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { chatId, messageId, type }: VoteMesage = await request.json();
  if (!chatId || !messageId || !type) {
    return new Response("messageId and type are required", { status: 400 });
  }

  await voteMessage({ chatId, messageId, type });
  return new Response("Message voted", { status: 200 });
}
