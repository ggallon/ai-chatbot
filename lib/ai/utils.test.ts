import { describe, it, expect } from 'vitest';

import { convertToDBMessages, convertToUIMessages } from './utils';

describe('convertToDBMessages', () => {
  describe('assistant message', () => {
    it('should convert a simple assistant message', () => {
      const createdAt = new Date();
      const result = convertToDBMessages({
        chatId: 'chatId',
        responseMessages: [
          {
            id: 'messageId',
            role: 'assistant',
            content: 'Assistant message',
            createdAt,
          },
        ],
      });

      expect(result).toEqual([
        {
          chatId: 'chatId',
          id: 'messageId',
          role: 'assistant',
          content: [{ text: 'Assistant message', type: 'text' }],
          createdAt,
        },
      ]);
    });

    it('should convert an assistant message with annotations', () => {
      const createdAt = new Date();
      const result = convertToDBMessages({
        chatId: 'chatId',
        responseMessages: [
          {
            id: 'messageId',
            role: 'assistant',
            content: 'Assistant message',
            annotations: [
              'string',
              {
                value: 'value',
              },
            ],
            createdAt,
          },
        ],
      });

      expect(result).toEqual([
        {
          chatId: 'chatId',
          id: 'messageId',
          role: 'assistant',
          content: [
            { type: 'text', text: 'Assistant message' },
            { type: 'annotation', data: ['string', { value: 'value' }] },
          ],
          createdAt,
        },
      ]);
    });
  });

  describe('user message', () => {
    it('should convert an user message with experimental_attachments', () => {
      const createdAt = new Date();
      const result = convertToDBMessages({
        chatId: 'chatId',
        responseMessages: [
          {
            id: 'messageId',
            role: 'user',
            content: 'user message',
            experimental_attachments: [
              {
                name: 'Image 1',
                contentType: 'image/png',
                url: 'https://server.com/image-1.png',
              },
              {
                name: 'File a',
                contentType: 'application/pdf',
                url: 'https://server.com/file-a.pdf',
              },
            ],
            createdAt,
          },
        ],
      });

      expect(result).toEqual([
        {
          chatId: 'chatId',
          id: 'messageId',
          role: 'user',
          content: [
            { type: 'text', text: 'user message' },
            {
              type: 'image',
              data: {
                name: 'Image 1',
                contentType: 'image/png',
                url: 'https://server.com/image-1.png',
              },
            },
            {
              type: 'file',
              data: {
                name: 'File a',
                contentType: 'application/pdf',
                url: 'https://server.com/file-a.pdf',
              },
            },
          ],
          createdAt,
        },
      ]);
    });
  });
});

describe('convertToUIMessages', () => {
  describe('assistant message', () => {
    it('should convert a simple assistant message', () => {
      const createdAt = new Date();
      const result = convertToUIMessages([
        {
          chatId: 'chatId',
          id: 'messageId',
          role: 'assistant',
          content: [{ type: 'text', text: 'Assistant message' }],
          createdAt,
        },
      ]);

      expect(result).toEqual([
        {
          id: 'messageId',
          role: 'assistant',
          content: 'Assistant message',
          parts: [{ type: 'text', text: 'Assistant message' }],
          createdAt,
        },
      ]);
    });

    it('should convert an assistant message with annotations', () => {
      const createdAt = new Date();
      const result = convertToUIMessages([
        {
          chatId: 'chatId',
          id: 'messageId',
          role: 'assistant',
          content: [
            { type: 'text', text: 'Assistant message' },
            { type: 'annotation', data: ['string', { value: 'value' }] },
          ],
          createdAt,
        },
      ]);

      expect(result).toEqual([
        {
          id: 'messageId',
          role: 'assistant',
          content: 'Assistant message',
          parts: [{ type: 'text', text: 'Assistant message' }],
          annotations: [
            'string',
            {
              value: 'value',
            },
          ],
          createdAt,
        },
      ]);
    });
  });

  describe('user message', () => {
    it('should convert an user message with experimental_attachments', () => {
      const createdAt = new Date();
      const result = convertToUIMessages([
        {
          chatId: 'chatId',
          id: 'messageId',
          role: 'user',
          content: [
            { type: 'text', text: 'user message' },
            {
              type: 'image',
              data: {
                name: 'Image 1',
                contentType: 'image/png',
                url: 'https://server.com/image-1.png',
              },
            },
            {
              type: 'file',
              data: {
                name: 'File a',
                contentType: 'application/pdf',
                url: 'https://server.com/file-a.pdf',
              },
            },
          ],
          createdAt,
        },
      ]);

      expect(result).toEqual([
        {
          id: 'messageId',
          role: 'user',
          content: 'user message',
          parts: [{ type: 'text', text: 'user message' }],
          experimental_attachments: [
            {
              name: 'Image 1',
              contentType: 'image/png',
              url: 'https://server.com/image-1.png',
            },
            {
              name: 'File a',
              contentType: 'application/pdf',
              url: 'https://server.com/file-a.pdf',
            },
          ],
          createdAt,
        },
      ]);
    });
  });
});
