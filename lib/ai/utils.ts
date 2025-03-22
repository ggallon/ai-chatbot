import type { Message, UIMessage } from 'ai';
import type { Message as DBMessage } from '@/lib/db/schema';

/**
 * Convert AI SDK messages to database messages.
 *
 * @returns A new array of DBMessage.
 */
export function convertToDBMessages({
  chatId,
  responseMessages,
}: {
  chatId: string;
  responseMessages: Array<Message>;
}): Array<DBMessage> {
  return responseMessages.map((message) => ({
    chatId,
    id: message.id,
    role: message.role,
    content: [
      ...(message.parts ?? [
        {
          type: 'text' as const,
          text: message.content,
        },
      ]),
      ...(message.annotations && message.annotations.length > 0
        ? [
            {
              type: 'annotation' as const,
              data: message.annotations,
            },
          ]
        : []),
      ...(message.experimental_attachments?.map((attachment) => {
        return { type: 'attachment' as const, data: attachment };
      }) ?? []),
    ],
    createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
  }));
}

export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<UIMessage> {
  return messages.reduce<Array<UIMessage>>((chatMessages, message) => {
    let textContent = '';
    const annotations: UIMessage['annotations'] = [];
    const experimental_attachments: UIMessage['experimental_attachments'] = [];
    const parts: UIMessage['parts'] = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
    }

    if (Array.isArray(message.content)) {
      for (const content of message.content) {
        switch (content.type) {
          case 'text':
            textContent += content.text;
            parts.push(content);
            break;
          case 'annotation':
            annotations.push(...content.data);
            break;
          case 'attachment':
            experimental_attachments.push(content.data);
            break;
          default:
            //case 'file':
            //case 'reasoning':
            //case 'source':
            //case 'tool-invocation':
            parts.push(content);
            break;
        }
      }
    }

    chatMessages.push({
      id: message.id,
      role: message.role,
      createdAt: message.createdAt,
      content: textContent,
      parts,
      ...(annotations.length > 0 && { annotations }),
      ...(experimental_attachments.length > 0 && { experimental_attachments }),
    });

    return chatMessages;
  }, []);
}

export function getLastUserMessage(messages: Array<UIMessage>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}
