import { type CustomModelIdProvider } from './setup-registry';

interface Model {
  id: CustomModelIdProvider;
  label: string;
  description: string;
}

export const DEFAULT_MODEL_NAME = 'openai:small-model';

export const models: Array<Model> = [
  {
    id: 'openai:small-model',
    label: 'GPT-4o mini',
    description: 'Fast, affordable small model for focused tasks',
  },
  {
    id: 'openai:large-model',
    label: 'GPT-4o',
    description: 'Fast, intelligent, flexible GPT model',
  },
  {
    id: 'openai:reasoning-model',
    label: 'o4-mini',
    description: 'Faster, more affordable reasoning model',
  },
] as const;

export function isReasoningModel(model: Model) {
  return model.id.includes('reasoning-model');
}
