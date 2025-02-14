import { experimental_generateImage as generateImage } from 'ai';

import { registry } from '@/lib/ai/setup-registry';
import { createDocumentHandler } from '@/lib/ai/tools/create-document-handler';

export const imageDocumentHandler = createDocumentHandler<'image'>({
  kind: 'image',
  onCreateDocument: async ({ title, modelApiIdentifier, dataStream }) => {
    const { image } = await generateImage({
      model: registry.imageModel(modelApiIdentifier),
      prompt: title,
      size: '1024x1024',
      n: 1,
    });

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return image.base64;
  },
  onUpdateDocument: async ({ description, modelApiIdentifier, dataStream }) => {
    const { image } = await generateImage({
      model: registry.imageModel(modelApiIdentifier),
      prompt: description,
      size: '1024x1024',
      n: 1,
    });

    dataStream.writeData({
      type: 'image-delta',
      content: image.base64,
    });

    return image.base64;
  },
});
