import {
  appendResponseMessages,
  createDataStreamResponse,
  streamText,
  type UIMessage,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { generateTitleFromUserMessage } from '@/app/(chat)/actions';
import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import { allowedTools } from '@/lib/ai/tools';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { createDocument } from '@/lib/ai/tools/document/create';
import { requestSuggestions } from '@/lib/ai/tools/document/suggestions';
import { updateDocument } from '@/lib/ai/tools/document/update';
import { convertToDBMessages, getLastUserMessage } from '@/lib/ai/utils';
import { getChatById, saveChat } from '@/lib/db/queries/chat';
import { saveMessages } from '@/lib/db/queries/message';
import { generateUUID } from '@/lib/utils/uuid';

export const maxDuration = 60;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }
  const userId = session.user.id;

  const {
    id,
    messages,
    modelId,
  }: { id: string; messages: Array<UIMessage>; modelId: string } =
    await request.json();

  const model = models.find((model) => model.id === modelId);
  if (!model) {
    return new Response('Model not found', { status: 404 });
  }

  const lastUserMessage = getLastUserMessage(messages);
  if (!lastUserMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });
  if (!chat) {
    const title = await generateTitleFromUserMessage({
      message: lastUserMessage.content,
    });
    await saveChat({
      id,
      userId,
      title,
      visibility: 'private',
      createdAt: new Date(),
    });
  }

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: customModel(model.id),
        system: systemPrompt,
        messages,
        maxSteps: 5,
        experimental_activeTools: allowedTools,
        experimental_generateMessageId: generateUUID,
        tools: {
          getWeather,
          createDocument: createDocument({
            modelIdentifier: model.id,
            dataStream,
            userId,
          }),
          updateDocument: updateDocument({
            modelIdentifier: model.id,
            dataStream,
            userId,
          }),
          requestSuggestions: requestSuggestions({
            modelIdentifier: model.id,
            dataStream,
            userId,
          }),
        },
        onFinish: async ({ response }) => {
          try {
            const responseMessages = appendResponseMessages({
              messages: [messages[messages.length - 1]],
              responseMessages: response.messages,
            });

            await saveMessages({
              messages: convertToDBMessages({
                chatId: id,
                responseMessages,
              }),
            });
          } catch (error) {
            console.error(
              'Failed to save chat:',
              error instanceof Error ? error.message : String(error),
            );
          }
        },
        experimental_telemetry: {
          isEnabled: true,
          functionId: 'stream-text',
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
