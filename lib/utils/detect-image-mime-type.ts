const mimeTypeSignatures = [
  { mimeType: 'image/gif', bytes: [0x47, 0x49, 0x46] },
  { mimeType: 'image/jpeg', bytes: [0xff, 0xd8] },
  { mimeType: 'image/png', bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mimeType: 'image/webp', bytes: [0x52, 0x49, 0x46, 0x46] },
] as const;

export type ImageMimeTypes = (typeof mimeTypeSignatures)[number]['mimeType'];

export const IMAGE_MIME_TYPES = mimeTypeSignatures.flatMap((mt) => mt.mimeType);

export function detectImageMimeType(
  image: Uint8Array,
): ImageMimeTypes | undefined {
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
