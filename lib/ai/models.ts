// Define your models here.

export interface Model {
  id: string;
  label: string;
  apiIdentifier: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'openai:gpt-4o-mini',
    label: 'GPT 4o mini',
    apiIdentifier: 'openai:gpt-4o-mini',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'openai:gpt-4o',
    label: 'GPT 4o',
    apiIdentifier: 'openai:gpt-4o',
    description: 'For complex, multi-step tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'openai:gpt-4o-mini';
