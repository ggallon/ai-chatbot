import { wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';
import { registry, type CustomOpenAIProvider } from './setup-registry';

export const customModel = (modeId: CustomOpenAIProvider) => {
  return wrapLanguageModel({
    model: registry.languageModel(modeId),
    middleware: customMiddleware,
  });
};
