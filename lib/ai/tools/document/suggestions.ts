import { streamObject, tool, type DataStreamWriter } from 'ai';
import { z } from 'zod';

import { customModel } from '@/lib/ai';
import { generateUUID } from '@/lib/utils/uuid';
import { getDocumentById } from '@/lib/db/queries/document';
import { saveSuggestions } from '@/lib/db/queries/suggestion';

import type { Model } from '@/lib/ai/models';
import type { Suggestion } from '@/lib/db/schema';

export interface ExtendedOptions {
  modelIdentifier: Model['id'];
  dataStream: DataStreamWriter;
  userId: string;
}

export const requestSuggestions = ({
  modelIdentifier,
  dataStream,
  userId,
}: ExtendedOptions) =>
  tool({
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
        model: customModel(modelIdentifier),
        system:
          'You are a help writing assistant. Given a piece of writing, please offer suggestions to improve the piece of writing and describe the change. It is very important for the edits to contain full sentences instead of just words. Max 5 suggestions.',
        prompt: document.content,
        output: 'array',
        schema: z.object({
          originalSentence: z.string().describe('The original sentence'),
          suggestedSentence: z.string().describe('The suggested sentence'),
          description: z.string().describe('The description of the suggestion'),
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

        dataStream.writeData({ type: 'suggestion', content: suggestion });

        suggestions.push(suggestion);
      }

      await saveSuggestions({
        suggestions: suggestions.map((suggestion) => ({
          ...suggestion,
          userId,
          createdAt: new Date(),
          documentCreatedAt: document.createdAt,
        })),
      });

      return {
        id: document.id,
        title: document.title,
        kind: document.kind,
        message: 'Suggestions have been added to the document',
      };
    },
  });
