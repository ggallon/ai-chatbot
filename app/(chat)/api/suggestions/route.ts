import { auth } from "@/app/(auth)/auth";
import { getSuggestionsByDocumentIdAndUserId } from "@/db/queries/suggestion";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const documentId = searchParams.get("documentId");
  if (!documentId) {
    return new Response("Not Found", { status: 404 });
  }

  const suggestions = await getSuggestionsByDocumentIdAndUserId({
    documentId,
    userId: session.user.id,
  });
  return Response.json(suggestions, { status: 200 });
}
