import { generateText, type UIMessage } from 'ai';

import { registry } from '@/lib/ai/setup-registry';

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text } = await generateText({
    model: registry.languageModel('title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 40 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: message.content,
  });

  return text;
}
