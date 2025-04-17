import { createOpenAI } from '@ai-sdk/openai';
import { createProviderRegistry, customProvider } from 'ai';

import { env } from '@/env/server';

const openai = createOpenAI({
  apiKey: env.OPENAI_API_KEY,
  organization: env.OPENAI_ORG,
  project: env.OPENAI_PROJECT,
  compatibility: 'strict',
});

// custom provider with different model settings:
const customOpenAI = customProvider({
  languageModels: {
    // alias model with custom settings:
    'small-model': openai('gpt-4o-mini-2024-07-18'),
    'large-model': openai('gpt-4o-2024-08-06'),
    'title-model': openai('gpt-4.1-nano-2025-04-14'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

export const registry = createProviderRegistry({
  openai: customOpenAI,
});

export type CustomModelIdProvider = Parameters<
  (typeof registry)['languageModel']
>['0'];
