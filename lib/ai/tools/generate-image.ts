import { put } from '@vercel/blob';
import { experimental_generateImage, tool, type UIMessage } from 'ai';
import { z } from 'zod';

import { registry } from '@/lib/ai/setup-registry';
import { detectImageMimeType } from '@/lib/utils/detect-image-mime-type';

import type { Model } from '@/lib/ai/models';

export interface ExtendedOptions {
  messageId: UIMessage['id'];
  modelIdentifier: Model['id'];
  userId: string;
}

export const generateImage = ({
  messageId,
  modelIdentifier,
  userId,
}: ExtendedOptions) =>
  tool({
    description: 'Generate an image',
    parameters: z.object({
      prompt: z.string().describe('The prompt to generate the image from'),
    }),
    execute: async ({ prompt }) => {
      const { image, responses } = await experimental_generateImage({
        model: registry.imageModel(modelIdentifier),
        n: 1,
        prompt,
        size: '1024x1024',
      });

      const contentType = detectImageMimeType(image.uint8Array);
      const name = `image.${contentType?.replaceAll('image/', '') ?? 'none'}`;
      const data = await put(
        `AIChat/${userId}/${messageId}/${name}`,
        Buffer.from(image.uint8Array),
        {
          access: 'public',
          contentType,
        },
      );

      return {
        name,
        contentType,
        url: data.url,
        metadata: {
          modelId: responses[0].modelId,
          processingMs: responses[0].headers
            ? responses[0].headers['openai-processing-ms']
            : 0,
        },
      };
    },
  });
