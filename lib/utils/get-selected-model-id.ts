'server-only';

import { cookies } from 'next/headers';

import { DEFAULT_MODEL_NAME, models } from '@/ai/models';

export async function getSelectedModelId() {
  const modelIdFromCookie = (await cookies()).get('model-id')?.value;
  const selectedModelId =
    models.find((model) => model.id === modelIdFromCookie)?.id ||
    DEFAULT_MODEL_NAME;
  return selectedModelId;
}
