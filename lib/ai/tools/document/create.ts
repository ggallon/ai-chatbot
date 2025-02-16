import { tool, type DataStreamWriter } from 'ai';
import { z } from 'zod';

import { imageDocumentHandler } from '@/artifacts/image/server';
import { textDocumentHandler } from '@/artifacts/text/server';
import { documentkindEnum } from '@/lib/db/schema';
import { generateUUID } from '@/lib/utils/uuid';

import type { Model } from '@/lib/ai/models';

export interface ExtendedOptions {
  modelIdentifier: Model['id'];
  dataStream: DataStreamWriter;
  userId: string;
}

export const createDocument = ({
  modelIdentifier,
  dataStream,
  userId,
}: ExtendedOptions) =>
  tool({
    description:
      'Create a document for a writing activity. This tool will call other functions that will generate the contents of the document based on the title and kind.',
    parameters: z.object({
      title: z.string(),
      kind: z.enum(documentkindEnum.enumValues),
    }),
    execute: async ({ title, kind }) => {
      const id = generateUUID();

      dataStream.writeData({ type: 'id', content: id });
      dataStream.writeData({ type: 'title', content: title });
      dataStream.writeData({ type: 'kind', content: kind });
      dataStream.writeData({ type: 'clear', content: '' });

      switch (kind) {
        case 'image':
          await imageDocumentHandler.onCreateDocument({
            id,
            title,
            modelIdentifier: 'openai:large-model',
            dataStream,
            userId,
          });
          break;
        case 'text':
          await textDocumentHandler.onCreateDocument({
            id,
            title,
            modelIdentifier,
            dataStream,
            userId,
          });
          break;
        default:
          throw new Error(`No document handler found for kind: ${kind}`);
      }

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title,
        kind,
        content: 'A document was created and is now visible to the user.',
      };
    },
  });
