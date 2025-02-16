// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'openai:small-model',
    label: 'GPT 4o mini',
    apiIdentifier: 'openai:small-model',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'openai:large-model',
    label: 'GPT 4o',
    apiIdentifier: 'openai:large-model',
    description: 'For complex, multi-step tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'openai:small-model';
