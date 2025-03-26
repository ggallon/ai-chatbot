import { streamObject } from 'ai';
import { z } from 'zod';

import { customModel } from '@/lib/ai';
import { createDocumentHandler } from '@/lib/ai/tools/create-document-handler';
import { generateDraftSheet } from '@/lib/ai/tools/generateDratf';

export const sheetDocumentHandler = createDocumentHandler<'sheet'>({
  kind: 'sheet',
  onCreateDocument: async ({ title, modelIdentifier, dataStream }) => {
    const { fullStream } = streamObject({
      model: customModel(modelIdentifier),
      system: `
      You are a spreadsheet creation assistant. Create a spreadsheet in csv format based on the given prompt. The spreadsheet should contain meaningful column headers and data.
      IMPORTANT CSV FORMATTING RULES:
      1. NEVER use commas (,) within cell contents as they will break the CSV format
      2. For numbers over 999, do not use any thousand separators (write as: 10000 not 10,000)
      3. Use semicolons (;) or spaces to separate multiple items in a cell
      `,
      prompt: title,
      schema: z.object({
        csv: z.string().describe('CSV data'),
      }),
    });

    return await generateDraftSheet({ fullStream, dataStream });
  },
  onUpdateDocument: async ({
    description,
    document,
    modelIdentifier,
    dataStream,
  }) => {
    const { fullStream } = streamObject({
      model: customModel(modelIdentifier),
      messages: [
        {
          role: 'user',
          content: `Update the following spreadsheet based on the given prompt:
            ${description}`,
        },
        { role: 'user', content: document.content ?? '' },
      ],
      schema: z.object({
        csv: z.string(),
      }),
    });

    return await generateDraftSheet({ fullStream, dataStream });
  },
});
