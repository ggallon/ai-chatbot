import { streamText } from 'ai';

import { customModel } from '@/lib/ai';
import { createDocumentHandler } from '@/lib/ai/tools/create-document-handler';
import { generateDraftText } from '@/lib/ai/tools/generateDratf';

export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title, modelApiIdentifier, dataStream }) => {
    const { fullStream } = streamText({
      model: customModel(modelApiIdentifier),
      system:
        'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
      prompt: title,
    });

    return await generateDraftText({ fullStream, dataStream });
  },
  onUpdateDocument: async ({
    description,
    document,
    modelApiIdentifier,
    dataStream,
  }) => {
    const { fullStream } = streamText({
      model: customModel(modelApiIdentifier),
      messages: [
        {
          role: 'user',
          content: `Update the following contents of the document based on the given prompt:
            ${description}`,
        },
        { role: 'user', content: document.content ?? '' },
      ],
      experimental_providerMetadata: {
        openai: {
          prediction: {
            type: 'content',
            content: document.content,
          },
        },
      },
    });

    return await generateDraftText({ fullStream, dataStream });
  },
});
