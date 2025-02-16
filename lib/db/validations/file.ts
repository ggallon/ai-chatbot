import { z } from 'zod';

const JPEG = 'image/jpeg';
const PNG = 'image/png';
const WEBP = 'image/webp';
const FileSizeMax = 5 * 1024 * 1024; // 5MB
const FileSizeMin = 1024; // 1 ko

export const AllowedFileTypes = [JPEG, PNG, WEBP];

export const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => AllowedFileTypes.includes(file.type.toLowerCase()), {
      message: `File type should be ${AllowedFileTypes.join(', ').replaceAll('image/', '').toUpperCase()}`,
    })
    .refine((file) => file.size >= FileSizeMin && file.size <= FileSizeMax, {
      message: 'File size should be more than 1 ko and less than 5MB',
    }),
});

/**
 * Inspects the first few bytes of a buffer to determine if
 * it matches the "magic number" of known file signatures.
 * https://en.wikipedia.org/wiki/List_of_file_signatures
 */
function detectContentType(buffer: Uint8Array) {
  if ([0xff, 0xd8, 0xff].every((b, i) => buffer[i] === b)) {
    return JPEG;
  }

  if (
    [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a].every(
      (b, i) => buffer[i] === b,
    )
  ) {
    return PNG;
  }

  if (
    [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50].every(
      (b, i) => !b || buffer[i] === b,
    )
  ) {
    return WEBP;
  }

  return null;
}
