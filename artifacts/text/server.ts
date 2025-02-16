import { streamText } from 'ai';

import { customModel } from '@/lib/ai';
import { createDocumentHandler } from '@/lib/ai/tools/create-document-handler';
import { generateDraftText } from '@/lib/ai/tools/generateDratf';

export const textDocumentHandler = createDocumentHandler<'text'>({
  kind: 'text',
  onCreateDocument: async ({ title, modelIdentifier, dataStream }) => {
    const { fullStream } = streamText({
      model: customModel(modelIdentifier),
      system:
        'Write about the given topic. Markdown is supported. Use headings wherever appropriate.',
      prompt: title,
    });

    return await generateDraftText({ fullStream, dataStream });
  },
  onUpdateDocument: async ({
    description,
    document,
    modelIdentifier,
    dataStream,
  }) => {
    const { fullStream } = streamText({
      model: customModel(modelIdentifier),
      messages: [
        {
          role: 'user',
          content: `Update the following contents of the document based on the given prompt:
            ${description}`,
        },
        { role: 'user', content: document.content ?? '' },
      ],
      providerOptions: {
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
