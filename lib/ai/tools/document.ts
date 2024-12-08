import { streamObject, streamText, tool, type StreamData } from 'ai';
import { z } from 'zod';

import { customModel } from '@/lib/ai';
import { generateUUID } from '@/lib/utils';
import {
  getDocumentById,
  saveDocument,
  saveSuggestions,
} from '@/lib/db/queries';

import type { Model } from '@/lib/ai/models';
import type { Suggestion } from '@/lib/db/schema';

export interface ExtendedOptions {
  modelApiIdentifier: Model['apiIdentifier'];
  streamingData: StreamData;
  userId?: string;
}

export const initDocumentTools = (options: ExtendedOptions) => {
  const { modelApiIdentifier, streamingData, userId } = options;
  return {
    createDocument: tool({
      description: 'Create a document for a writing activity',
      parameters: z.object({
        title: z.string(),
      }),
      execute: async ({ title }) => {
        const id = generateUUID();

        streamingData.append({ type: 'id', content: id });
        streamingData.append({ type: 'title', content: title });
        streamingData.append({ type: 'clear', content: '' });

        const { fullStream } = streamText({
          model: customModel(modelApiIdentifier),
          system:
            'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
          prompt: title,
        });

        let draftText = '';
        for await (const delta of fullStream) {
          const { type } = delta;

          if (type === 'text-delta') {
            const { textDelta } = delta;

            draftText += textDelta;
            streamingData.append({
              type: 'text-delta',
              content: textDelta,
            });
          }
        }

        streamingData.append({ type: 'finish', content: '' });

        if (userId) {
          await saveDocument({
            id,
            title,
            content: draftText,
            userId,
          });
        }

        return {
          id,
          title,
          content: 'A document was created and is now visible to the user.',
        };
      },
    }),
    updateDocument: tool({
      description: 'Update a document with the given description',
      parameters: z.object({
        id: z.string().describe('The ID of the document to update'),
        description: z
          .string()
          .describe('The description of changes that need to be made'),
      }),
      execute: async ({ id, description }) => {
        const document = await getDocumentById({ id });
        if (!document) {
          return {
            error: 'Document not found',
          };
        }

        const { content: currentContent } = document;
        let draftText = '';

        streamingData.append({
          type: 'clear',
          content: document.title,
        });

        const { fullStream } = streamText({
          model: customModel(modelApiIdentifier),
          system:
            'You are a helpful writing assistant. Based on the description, please update the piece of writing.',
          experimental_providerMetadata: {
            openai: {
              prediction: {
                type: 'content',
                content: currentContent,
              },
            },
          },
          messages: [
            {
              role: 'user',
              content: description,
            },
            { role: 'user', content: currentContent ?? '' },
          ],
        });

        for await (const delta of fullStream) {
          const { type } = delta;

          if (type === 'text-delta') {
            const { textDelta } = delta;

            draftText += textDelta;
            streamingData.append({
              type: 'text-delta',
              content: textDelta,
            });
          }
        }

        streamingData.append({ type: 'finish', content: '' });

        if (userId) {
          await saveDocument({
            id,
            title: document.title,
            content: draftText,
            userId,
          });
        }

        return {
          id,
          title: document.title,
          content: 'The document has been updated successfully.',
        };
      },
    }),
    requestSuggestions: tool({
      description: 'Request suggestions for a document',
      parameters: z.object({
        documentId: z
          .string()
          .describe('The ID of the document to request edits'),
      }),
      execute: async ({ documentId }) => {
        const document = await getDocumentById({ id: documentId });
        if (!document || !document.content) {
          return {
            error: 'Document not found',
          };
        }

        const { elementStream } = streamObject({
          model: customModel(modelApiIdentifier),
          system:
            'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
          prompt: document.content,
          output: 'array',
          schema: z.object({
            originalSentence: z.string().describe('The original sentence'),
            suggestedSentence: z.string().describe('The suggested sentence'),
            description: z
              .string()
              .describe('The description of the suggestion'),
          }),
        });

        const suggestions: Array<
          Omit<Suggestion, 'userId' | 'createdAt' | 'documentCreatedAt'>
        > = [];

        for await (const element of elementStream) {
          const suggestion = {
            id: generateUUID(),
            documentId: documentId,
            originalText: element.originalSentence,
            suggestedText: element.suggestedSentence,
            description: element.description,
            isResolved: false,
          };

          streamingData.append({ type: 'suggestion', content: suggestion });

          suggestions.push(suggestion);
        }

        if (userId) {
          await saveSuggestions({
            suggestions: suggestions.map((suggestion) => ({
              ...suggestion,
              userId,
              createdAt: new Date(),
              documentCreatedAt: document.createdAt,
            })),
          });
        }

        return {
          id: documentId,
          title: document.title,
          message: 'Suggestions have been added to the document',
        };
      },
    }),
  };
};
