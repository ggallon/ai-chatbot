import { auth } from "@/app/(auth)/auth";
import { getVotesByChatId } from "@/db/queries/vote";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const [session, paramsValue] = await Promise.all([auth(), params]);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!paramsValue.chatId) {
    return new Response("chatId is required", { status: 400 });
  }

  const votes = await getVotesByChatId({ id: paramsValue.chatId });
  return Response.json(votes, { status: 200 });
}
