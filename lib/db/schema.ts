import {
  relations,
  sql,
  type InferInsertModel,
  type InferSelectModel,
  type SQL,
} from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  varchar,
  timestamp,
  json,
  uuid,
  text,
  primaryKey,
  foreignKey,
  boolean,
  uniqueIndex,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';

import type {
  Attachment,
  FileUIPart,
  JSONValue,
  Message as AIMessage,
  ReasoningUIPart,
  StepStartUIPart,
  SourceUIPart,
  TextUIPart,
  ToolInvocationUIPart,
} from '@ai-sdk/ui-utils';

// custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export const user = pgTable(
  'User',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: varchar('email', { length: 64 }).notNull(),
    image: text(),
    password: varchar('password', { length: 64 }).notNull(),
  },
  (table) => [uniqueIndex('User_emailUniqueIndex').on(lower(table.email))],
);

export type User = InferSelectModel<typeof user>;
export type InsertUser = InferInsertModel<typeof user>;

export const chatVisibilityEnum = pgEnum('visibility', ['public', 'private']);
export type ChatVisibility = (typeof chatVisibilityEnum.enumValues)[number];

export const chat = pgTable('Chat', {
  id: uuid().primaryKey().defaultRandom(),
  createdAt: timestamp().notNull(),
  title: text().notNull(),
  userId: uuid()
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  visibility: chatVisibilityEnum().notNull(),
});

export type Chat = InferSelectModel<typeof chat>;
export type InsertChat = InferInsertModel<typeof chat>;

type AnnotationBDPart = {
  type: 'annotation';

  /**
   * The annotation content.
   */
  data: JSONValue[];
};

type AttachmentBDPart = {
  type: 'attachment';

  /**
   * The data attachment.
   */
  data: Attachment;
};

export type MessageContent = Array<
  | FileUIPart
  | TextUIPart
  | ReasoningUIPart
  | StepStartUIPart
  | SourceUIPart
  | ToolInvocationUIPart
  | AnnotationBDPart
  | AttachmentBDPart
>;

export const message = pgTable('Message', {
  id: uuid().primaryKey().defaultRandom(),
  chatId: uuid()
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' }),
  role: varchar().$type<AIMessage['role']>().notNull(),
  content: json().$type<MessageContent>().notNull(),
  createdAt: timestamp().notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid().notNull(),
    messageId: uuid()
      .notNull()
      .references(() => message.id, { onDelete: 'cascade' }),
    isUpvoted: boolean().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.chatId, table.messageId],
    }),
  ],
);

export type Vote = InferSelectModel<typeof vote>;

export const documentkindEnum = pgEnum('documentkind', [
  'text',
  'sheet',
  'image',
  'code',
]);
export type DocumentKind = (typeof documentkindEnum.enumValues)[number];

export const document = pgTable(
  'Document',
  {
    id: uuid().notNull().defaultRandom(),
    kind: documentkindEnum().notNull(),
    createdAt: timestamp().notNull(),
    userId: uuid()
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    content: text(),
  },
  (table) => [
    primaryKey({
      columns: [table.id, table.createdAt],
    }),
  ],
);

export type Document = InferSelectModel<typeof document>;
export type InsertDocument = InferInsertModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid().primaryKey().defaultRandom(),
    documentId: uuid().notNull(),
    documentCreatedAt: timestamp().notNull(),
    originalText: text().notNull(),
    suggestedText: text().notNull(),
    description: text(),
    isResolved: boolean().notNull().default(false),
    userId: uuid()
      .notNull()
      .references(() => user.id),
    createdAt: timestamp().notNull(),
  },
  (table) => [
    foreignKey({
      name: 'Suggestion_doctId_docCreatedAt_Doc_id_createdAt_fk',
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }).onDelete('cascade'),
  ],
);

export type Suggestion = InferSelectModel<typeof suggestion>;

export const userRelations = relations(user, ({ many }) => ({
  chats: many(chat),
}));

export type UserWithChat = User & {
  chats: Array<Chat>;
};

export const chatRelations = relations(chat, ({ one, many }) => ({
  user: one(user, {
    fields: [chat.userId],
    references: [user.id],
  }),
  messages: many(message),
}));

export type ChatWithMessages = Chat & {
  messages: Array<Message>;
};

export const messageRelations = relations(message, ({ one }) => ({
  chat: one(chat, {
    fields: [message.chatId],
    references: [chat.id],
  }),
}));

export type MessageWithChat = Message & {
  chat: Chat;
};
