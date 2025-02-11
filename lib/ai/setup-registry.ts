import { createOpenAI } from '@ai-sdk/openai';

import {
  experimental_createProviderRegistry as createProviderRegistry,
  customProvider,
} from 'ai';

const openai = createOpenAI({
  organization: process.env.OPENAI_ORG,
  project: process.env.OPENAI_PROJECT,
  compatibility: 'strict',
});

// custom provider with different model settings:
const customOpenAI = customProvider({
  languageModels: {
    // alias model with custom settings:
    'small-model': openai('gpt-4o-mini-2024-07-18'),
    'large-model': openai('gpt-4o-2024-08-06'),
    'title-model': openai('gpt-4o-mini-2024-07-18'),
  },
  imageModels: {
    'small-model': openai.image('dall-e-2'),
    'large-model': openai.image('dall-e-3'),
  },
});

export const registry = createProviderRegistry({
  openai: customOpenAI,
});
