import {
  convertToCoreMessages,
  createDataStreamResponse,
  streamText,
  type Message,
} from 'ai';

import { auth } from '@/app/(auth)/auth';
import { generateTitleFromUserMessage } from '@/app/(chat)/actions';
import { customModel } from '@/lib/ai';
import { models } from '@/lib/ai/models';
import { systemPrompt } from '@/lib/ai/prompts';
import { getWeather } from '@/lib/ai/tools/get-weather';
import { createDocument } from '@/lib/ai/tools/document/create';
import { requestSuggestions } from '@/lib/ai/tools/document/suggestions';
import { updateDocument } from '@/lib/ai/tools/document/update';
import { getLastUserMessage, sanitizeResponseMessages } from '@/lib/ai/utils';
import { getChatById, saveChat } from '@/lib/db/queries/chat';
import { saveMessages } from '@/lib/db/queries/message';
import { generateUUID } from '@/lib/utils/uuid';

export const maxDuration = 60;

type AllowedTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions'
  | 'getWeather';

const artifactsTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
];

const weatherTools: AllowedTools[] = ['getWeather'];

const allTools: AllowedTools[] = [...artifactsTools, ...weatherTools];

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
  }: { id: string; messages: Array<Message>; modelId: string } =
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

  await saveMessages({
    messages: [
      {
        ...lastUserMessage,
        content: convertToCoreMessages([lastUserMessage])[0].content,
        chatId: id,
        createdAt: lastUserMessage.createdAt
          ? new Date(lastUserMessage.createdAt)
          : new Date(),
      },
    ],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt,
        messages,
        maxSteps: 5,
        experimental_activeTools: allTools,
        experimental_generateMessageId: generateUUID,
        tools: {
          getWeather,
          createDocument: createDocument({
            modelApiIdentifier: model.apiIdentifier,
            dataStream,
            userId,
          }),
          updateDocument: updateDocument({
            modelApiIdentifier: model.apiIdentifier,
            dataStream,
            userId,
          }),
          requestSuggestions: requestSuggestions({
            modelApiIdentifier: model.apiIdentifier,
            dataStream,
            userId,
          }),
        },
        onFinish: async ({ response }) => {
          try {
            const responseMessagesWithoutIncompleteToolCalls =
              sanitizeResponseMessages(response.messages);

            await saveMessages({
              messages: responseMessagesWithoutIncompleteToolCalls.map(
                (message) => {
                  return {
                    id: message.id,
                    chatId: id,
                    role: message.role,
                    content: message.content,
                    createdAt: new Date(),
                  };
                },
              ),
            });
          } catch (error) {
            console.error('Failed to save chat');
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
