import { createOpenAI } from '@ai-sdk/openai';

import {
  experimental_createProviderRegistry as createProviderRegistry,
  experimental_customProvider as customProvider,
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
    'gpt-4o-mini-structured': openai('gpt-4o-mini', {
      structuredOutputs: true,
    }),
  },
  fallbackProvider: openai,
});

export const registry = createProviderRegistry({
  openai: customOpenAI,
});
