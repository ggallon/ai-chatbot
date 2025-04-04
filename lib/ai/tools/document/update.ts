import { tool, type DataStreamWriter } from 'ai';
import { z } from 'zod';

import { imageDocumentHandler } from '@/artifacts/image/server';
import { sheetDocumentHandler } from '@/artifacts/sheet/server';
import { textDocumentHandler } from '@/artifacts/text/server';
import { getDocumentById } from '@/lib/db/queries/document';

import { type CustomModelIdProvider } from '@/lib/ai/setup-registry';

interface ExtendedOptions {
  modelIdentifier: CustomModelIdProvider;
  dataStream: DataStreamWriter;
  userId: string;
}

export const updateDocument = ({
  modelIdentifier,
  dataStream,
  userId,
}: ExtendedOptions) =>
  tool({
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

      dataStream.writeData({ type: 'clear', content: document.title });

      switch (document.kind) {
        case 'image':
          await imageDocumentHandler.onUpdateDocument({
            document,
            description,
            modelIdentifier: 'openai:large-model',
            dataStream,
            userId,
          });
          break;
        case 'sheet':
          await sheetDocumentHandler.onUpdateDocument({
            document,
            description,
            modelIdentifier,
            dataStream,
            userId,
          });
          break;
        case 'text':
          await textDocumentHandler.onUpdateDocument({
            document,
            description,
            modelIdentifier,
            dataStream,
            userId,
          });
          break;
        default:
          throw new Error(
            `No document handler found for kind: ${document.kind}`,
          );
      }

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title: document.title,
        kind: document.kind,
        content: 'The document has been updated successfully.',
      };
    },
  });
