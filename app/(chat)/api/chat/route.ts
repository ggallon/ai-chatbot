import {
  createDataStreamResponse,
  convertToCoreMessages,
  streamText,
  type Message,
} from "ai";

import { customModel } from "@/ai";
import { models } from "@/ai/models";
import { blocksPrompt, regularPrompt } from "@/ai/prompts";
import { getWeather } from "@/ai/tools/weather";
import { createDocument } from "@/ai/tools/document/create";
import { updateDocument } from "@/ai/tools/document/update";
import { requestSuggestions } from "@/ai/tools/document/request-suggestions";
import { getMostRecentUserMessage, sanitizeResponseMessages } from "@/ai/utils";
import { auth } from "@/app/(auth)/auth";
import { generateTitleFromUserMessage } from "@/app/(chat)/actions";
import { getChatByIdAndUserId, saveChat } from "@/db/queries/chat";
import { saveMessages } from "@/db/queries/message";
import { generateUUID } from "@/lib/utils/uuid";

type AllowedTools =
  | "createDocument"
  | "updateDocument"
  | "requestSuggestions"
  | "getWeather";

const blocksTools: AllowedTools[] = [
  "createDocument",
  "updateDocument",
  "requestSuggestions",
];

const weatherTools: AllowedTools[] = ["getWeather"];

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const {
    id: chatId,
    messages,
    modelId,
  }: {
    id: string;
    messages: Array<Message>;
    modelId: string;
  } = await request.json();

  if (!chatId) {
    return new Response("Missing chat Id", { status: 400 });
  }

  const model = models.find((model) => model.id === modelId);
  if (!model) {
    return new Response("Model not found", { status: 404 });
  }

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);
  if (!userMessage) {
    return new Response("No user message found", { status: 400 });
  }

  const userId = session.user.id;
  const chat = await getChatByIdAndUserId({ id: chatId, userId });
  if (!chat) {
    const generatedTitle = await generateTitleFromUserMessage({
      message: userMessage,
    });
    await saveChat({ id: chatId, userId, title: generatedTitle });
  }

  await saveMessages({
    messages: [
      { ...userMessage, id: generateUUID(), chatId, createdAt: new Date() },
    ],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: modelId === "gpt-4o-blocks" ? blocksPrompt : regularPrompt,
        messages: coreMessages,
        maxSteps: 5,
        experimental_activeTools:
          modelId === "gpt-4o-blocks" ? blocksTools : weatherTools,
        tools: {
          getWeather,
          createDocument: createDocument({ model, dataStream, userId }),
          updateDocument: updateDocument({ model, dataStream, userId }),
          requestSuggestions: requestSuggestions({ model, dataStream, userId }),
        },
        onFinish: async ({ response }) => {
          try {
            const responseMessagesWithoutIncompleteToolCalls =
              sanitizeResponseMessages(response.messages);

            await saveMessages({
              messages: responseMessagesWithoutIncompleteToolCalls.map(
                (message) => {
                  const messageId = generateUUID();

                  if (message.role === "assistant") {
                    dataStream.writeMessageAnnotation({
                      messageIdFromServer: messageId,
                    });
                  }

                  return {
                    id: messageId,
                    chatId,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  };
                }
              ),
            });
          } catch (error) {
            console.error("Failed to save chat");
          }
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
}
