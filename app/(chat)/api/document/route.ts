import { auth } from "@/app/(auth)/auth";
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsByIdAndUserId,
  saveDocument,
} from "@/db/queries/document";

import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const documents = await getDocumentsByIdAndUserId({
    id,
    userId: session.user.id,
  });
  if (documents.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const { content, title }: { content: string; title: string } =
    await request.json();

  await saveDocument({
    id,
    content,
    title,
    userId: session.user.id,
  });

  return new Response("Saved", { status: 200 });
}

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  if (!id) {
    return new Response("Missing id", { status: 400 });
  }

  const { timestamp }: { timestamp: string } = await request.json();

  const documents = await getDocumentsByIdAndUserId({
    id,
    userId: session.user.id,
  });
  if (documents.length === 0) {
    return new Response("Not Found", { status: 404 });
  }

  await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return new Response("Deleted", { status: 200 });
}
