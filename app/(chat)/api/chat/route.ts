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
import { initDocumentTools } from '@/lib/ai/tools/document';
import {
  getMostRecentUserMessage,
  sanitizeResponseMessages,
} from '@/lib/ai/utils';
import { getChatById, saveChat, saveMessages } from '@/lib/db/queries';
import { generateUUID } from '@/lib/utils/uuid';

export const maxDuration = 60;

type AllowedTools =
  | 'createDocument'
  | 'updateDocument'
  | 'requestSuggestions'
  | 'getWeather';

const blocksTools: AllowedTools[] = [
  'createDocument',
  'updateDocument',
  'requestSuggestions',
];

const weatherTools: AllowedTools[] = ['getWeather'];

const allTools: AllowedTools[] = [...blocksTools, ...weatherTools];

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

  const coreMessages = convertToCoreMessages(messages);
  const userMessage = getMostRecentUserMessage(coreMessages);
  if (!userMessage) {
    return new Response('No user message found', { status: 400 });
  }

  const chat = await getChatById({ id });
  if (!chat) {
    const title = await generateTitleFromUserMessage({ message: userMessage });
    await saveChat({ id, userId, title });
  }

  const userMessageId = generateUUID();
  await saveMessages({
    messages: [
      { ...userMessage, id: userMessageId, createdAt: new Date(), chatId: id },
    ],
  });

  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        type: 'user-message-id',
        content: userMessageId,
      });

      const documentTools = initDocumentTools({
        modelApiIdentifier: model.apiIdentifier,
        dataStream,
        userId,
      });

      const result = streamText({
        model: customModel(model.apiIdentifier),
        system: systemPrompt,
        messages: coreMessages,
        maxSteps: 5,
        experimental_activeTools: allTools,
        tools: {
          getWeather,
          ...documentTools,
        },
        onFinish: async ({ response }) => {
          try {
            const responseMessagesWithoutIncompleteToolCalls =
              sanitizeResponseMessages(response.messages);

            await saveMessages({
              messages: responseMessagesWithoutIncompleteToolCalls.map(
                (message) => {
                  const messageId = generateUUID();

                  if (message.role === 'assistant') {
                    dataStream.writeMessageAnnotation({
                      messageIdFromServer: messageId,
                    });
                  }

                  return {
                    id: messageId,
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
