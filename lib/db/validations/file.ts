import { z } from 'zod';

import { IMAGE_MIME_TYPES } from '@/lib/utils/detect-image-mime-type';

const FileSizeMax = 4 * 1024 * 1024; // 4MB
const FileSizeMin = 1024; // 1 ko

export const ALLOWED_IMAGE_MIME_TYPES = IMAGE_MIME_TYPES.filter(
  (imt) => imt !== 'image/gif',
);

export type AllowedImageMimeTypes = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine(
      (file) =>
        ALLOWED_IMAGE_MIME_TYPES.includes(
          file.type.toLowerCase() as AllowedImageMimeTypes,
        ),
      {
        message: `File type should be ${ALLOWED_IMAGE_MIME_TYPES.join(', ').replaceAll('image/', '').toUpperCase()}`,
      },
    )
    .refine((file) => file.size >= FileSizeMin && file.size <= FileSizeMax, {
      message: 'File size should be more than 1 ko and less than 4MB',
    }),
});
