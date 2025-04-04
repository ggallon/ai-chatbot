import { wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';
import { registry, type CustomModelIdProvider } from './setup-registry';

export const customModel = (modeId: CustomModelIdProvider) => {
  return wrapLanguageModel({
    model: registry.languageModel(modeId),
    middleware: customMiddleware,
  });
};
