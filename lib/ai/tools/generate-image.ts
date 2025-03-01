import { put } from '@vercel/blob';
import { experimental_generateImage, tool, type UIMessage } from 'ai';
import { z } from 'zod';

import { registry } from '@/lib/ai/setup-registry';

import type { Model } from '@/lib/ai/models';

const mimeTypeSignatures = [
  { mimeType: 'image/gif' as const, bytes: [0x47, 0x49, 0x46] },
  { mimeType: 'image/png' as const, bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mimeType: 'image/jpeg' as const, bytes: [0xff, 0xd8] },
  { mimeType: 'image/webp' as const, bytes: [0x52, 0x49, 0x46, 0x46] },
];

function detectImageMimeType(
  image: Uint8Array,
): 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp' | undefined {
  for (const { bytes, mimeType } of mimeTypeSignatures) {
    if (
      image.length >= bytes.length &&
      bytes.every((byte, index) => image[index] === byte)
    ) {
      return mimeType;
    }
  }

  return undefined;
}

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
      const { image } = await experimental_generateImage({
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
        image: { name, contentType, url: data.url },
        prompt,
      };
    },
  });
