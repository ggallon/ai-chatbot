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
} from "drizzle-orm/pg-core";
import { v4 as uuidv4 } from "uuid";

export const user = pgTable("User", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  email: varchar("email", { length: 64 }).unique().notNull(),
  password: varchar("password", { length: 64 }),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export type User = typeof user.$inferSelect;

export const chat = pgTable("Chat", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  userId: uuid("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("createdAt").notNull(),
  title: text("title").notNull(),
});

export type Chat = typeof chat.$inferSelect;

export const message = pgTable("Message", {
  id: uuid("id")
    .primaryKey()
    .$defaultFn(() => uuidv4()),
  chatId: uuid("chatId")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
  role: varchar("role").notNull(),
  createdAt: timestamp("createdAt").notNull(),
  content: json("content").notNull(),
});

export type Message = typeof message.$inferSelect;

export const vote = pgTable(
  "Vote",
  {
    chatId: uuid("chatId").notNull(),
    messageId: uuid("messageId")
      .notNull()
      .references(() => message.id, { onDelete: "cascade" }),
    isUpvoted: boolean("isUpvoted").notNull(),
  },
  (table) => [
    primaryKey({
      name: "pkey_chatId_messageId",
      columns: [table.chatId, table.messageId],
    }),
  ]
);

export type Vote = typeof vote.$inferSelect;

export const document = pgTable(
  "Document",
  {
    id: uuid("id").$defaultFn(() => uuidv4()),
    createdAt: timestamp("createdAt").notNull(),
    title: text("title").notNull(),
    content: text("content"),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({
      name: "pkey_id_createdAt",
      columns: [table.id, table.createdAt],
    }),
  ]
);

export type Document = typeof document.$inferSelect;

export const suggestion = pgTable(
  "Suggestion",
  {
    id: uuid("id")
      .primaryKey()
      .$defaultFn(() => uuidv4()),
    documentId: uuid("documentId").notNull(),
    documentCreatedAt: timestamp("documentCreatedAt").notNull(),
    originalText: text("originalText").notNull(),
    suggestedText: text("suggestedText").notNull(),
    description: text("description"),
    isResolved: boolean("isResolved").notNull().default(false),
    userId: uuid("userId")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("createdAt").notNull(),
  },
  (table) => [
    foreignKey({
      name: "fkey_documentId_documentCreatedAt",
      columns: [table.documentId, table.documentCreatedAt],
      foreignColumns: [document.id, document.createdAt],
    }),
  ]
);

export type Suggestion = typeof suggestion.$inferSelect;
