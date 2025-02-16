import { wrapLanguageModel } from 'ai';

import { customMiddleware } from './custom-middleware';
import { registry } from './setup-registry';

export const customModel = (modeId: string) => {
  return wrapLanguageModel({
    model: registry.languageModel(modeId),
    middleware: customMiddleware,
  });
};
