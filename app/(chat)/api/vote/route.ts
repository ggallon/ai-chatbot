import { type NextRequest } from "next/server";

import { auth } from "@/app/(auth)/auth";
import {
  getVotesByChatId,
  voteMessage,
  type VoteMesage,
} from "@/db/queries/vote";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const chatId = searchParams.get("chatId");
  if (!chatId) {
    return new Response("chatId is required", { status: 400 });
  }

  const votes = await getVotesByChatId({ id: chatId });
  return Response.json(votes, { status: 200 });
}

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
