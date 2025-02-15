import type { CoreUserMessage, Message, UIMessage } from 'ai';
import type { Message as DBMessage } from '@/lib/db/schema';

export function convertToDBMessages({
  chatId,
  responseMessages,
}: {
  chatId: string;
  responseMessages: Array<Message>;
}): Array<DBMessage> {
  return responseMessages.map((message) => {
    const annotations = message.annotations ?? [];
    const experimental_attachments = message.experimental_attachments ?? [];

    return {
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
        ...annotations.map((annotation) => ({
          type: 'annotation' as const,
          annotation,
        })),
        ...experimental_attachments.map((attachment) => ({
          type: 'image' as const,
          attachment,
        })),
      ],
      createdAt: message.createdAt ? new Date(message.createdAt) : new Date(),
    };
  });
}

export function convertToUIMessages(
  messages: Array<DBMessage>,
): Array<UIMessage> {
  return messages.reduce((chatMessages: Array<UIMessage>, message) => {
    let textContent = '';
    const annotations: UIMessage['annotations'] = [];
    const experimental_attachments: UIMessage['experimental_attachments'] = [];
    const toolInvocations: UIMessage['toolInvocations'] = [];
    const parts: UIMessage['parts'] = [];

    if (typeof message.content === 'string') {
      textContent = message.content;
      parts.push({
        type: 'text' as const,
        text: message.content,
      });
    } else if (Array.isArray(message.content)) {
      for (const content of message.content) {
        switch (content.type) {
          case 'text':
            textContent += content.text;
            parts.push(content);
            break;
          case 'image':
            experimental_attachments.push(content.attachment);
            break;
          case 'annotation':
            annotations.push(content.annotation);
            break;
          case 'tool-invocation':
            toolInvocations.push(content.toolInvocation);
            parts.push(content);
            break;
          case 'reasoning':
          case 'source':
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
      annotations,
      experimental_attachments,
      toolInvocations,
      parts,
    });

    return chatMessages;
  }, []);
}

export function sanitizeUIMessages(messages: Array<Message>): Array<Message> {
  const messagesBySanitizedToolInvocations = messages.map((message) => {
    if (message.role !== 'assistant') return message;
    if (!message.toolInvocations) return message;

    const toolResultIds: Array<string> = [];
    for (const toolInvocation of message.toolInvocations) {
      if (toolInvocation.state === 'result') {
        toolResultIds.push(toolInvocation.toolCallId);
      }
    }

    const sanitizedToolInvocations = message.toolInvocations.filter(
      (toolInvocation) =>
        toolInvocation.state === 'result' ||
        toolResultIds.includes(toolInvocation.toolCallId),
    );

    return {
      ...message,
      toolInvocations: sanitizedToolInvocations,
    };
  });

  return messagesBySanitizedToolInvocations.filter(
    (message) =>
      message.content.length > 0 ||
      (message.toolInvocations && message.toolInvocations.length > 0),
  );
}

export function getLastUserMessageText(
  lastMessage: Message,
): CoreUserMessage['content'] | undefined {
  if (lastMessage?.role !== 'user') {
    return undefined;
  }

  return lastMessage.content;
}

export function getLastUserMessage(messages: Array<Message>) {
  const userMessages = messages.filter((message) => message.role === 'user');
  return userMessages.at(-1);
}
