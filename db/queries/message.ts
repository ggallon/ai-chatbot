import "server-only";

import { db } from "@/db/db";
import { message, type Message } from "@/db/schema";

export async function saveMessages({ messages }: { messages: Array<Message> }) {
  try {
    return await db.insert(message).values(messages);
  } catch (error) {
    console.error("Failed to save messages in database", error);
    throw error;
  }
}
