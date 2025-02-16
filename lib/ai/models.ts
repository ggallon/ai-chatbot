export interface Model {
  id: string;
  label: string;
  description: string;
}

export const models: Array<Model> = [
  {
    id: 'openai:small-model',
    label: 'GPT 4o mini',
    description: 'Small model for fast, lightweight tasks',
  },
  {
    id: 'openai:large-model',
    label: 'GPT 4o',
    description: 'For complex, multi-step tasks',
  },
] as const;

export const DEFAULT_MODEL_NAME: string = 'openai:small-model';
