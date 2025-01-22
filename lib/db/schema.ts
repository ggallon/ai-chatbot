import { sql, type InferSelectModel, type SQL } from 'drizzle-orm';
import {
  pgTable,
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

// custom lower function
export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export const user = pgTable(
  'User',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 64 }).notNull(),
    password: varchar('password', { length: 64 }),
  },
  (table) => [uniqueIndex('User_emailUniqueIndex').on(lower(table.email))],
);

export type User = InferSelectModel<typeof user>;

export const chat = pgTable('Chat', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('createdAt').notNull(),
  title: text('title').notNull(),
  userId: uuid('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  visibility: varchar('visibility', { enum: ['public', 'private'] })
    .notNull()
    .default('private'),
});

export type Chat = InferSelectModel<typeof chat>;

export const message = pgTable('Message', {
  id: uuid('id').primaryKey().defaultRandom(),
  chatId: uuid('chatId')
    .notNull()
    .references(() => chat.id, { onDelete: 'cascade' }),
  role: varchar('role').notNull(),
  content: json('content').notNull(),
  createdAt: timestamp('createdAt').notNull(),
});

export type Message = InferSelectModel<typeof message>;

export const vote = pgTable(
  'Vote',
  {
    chatId: uuid('chatId').notNull(),
    messageId: uuid('messageId')
      .notNull()
      .references(() => message.id, { onDelete: 'cascade' }),
    isUpvoted: boolean('isUpvoted').notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.chatId, table.messageId],
    }),
  ],
);

export type Vote = InferSelectModel<typeof vote>;

export type DocumentKind = 'text' | 'image' | 'code';

export const document = pgTable(
  'Document',
  {
    id: uuid('id').notNull().defaultRandom(),
    kind: varchar('kind', { enum: ['text', 'image', 'code'] })
      .$type<DocumentKind>()
      .notNull()
      .default('text'),
    createdAt: timestamp('createdAt').notNull(),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    content: text('content'),
  },
  (table) => [
    primaryKey({
      columns: [table.id, table.createdAt],
    }),
  ],
);

export type Document = InferSelectModel<typeof document>;

export const suggestion = pgTable(
  'Suggestion',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    documentId: uuid('documentId').notNull(),
    documentCreatedAt: timestamp('documentCreatedAt').notNull(),
    originalText: text('originalText').notNull(),
    suggestedText: text('suggestedText').notNull(),
    description: text('description'),
    isResolved: boolean('isResolved').notNull().default(false),
    userId: uuid('userId')
      .notNull()
      .references(() => user.id),
    createdAt: timestamp('createdAt').notNull(),
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
