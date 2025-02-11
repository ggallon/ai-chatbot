import { saveDocument } from '@/lib/db/queries/document';

import type { DataStreamWriter } from 'ai';
import type { Model } from '@/lib/ai/models';
import type { Document, DocumentKind } from '@/lib/db/schema';

interface CreateDocumentCallbackProps {
  id: string;
  title: string;
  modelApiIdentifier: Model['apiIdentifier'];
  dataStream: DataStreamWriter;
  userId: string;
}

interface UpdateDocumentCallbackProps {
  document: Document;
  description: string;
  modelApiIdentifier: Model['apiIdentifier'];
  dataStream: DataStreamWriter;
  userId: string;
}

interface DocumentHandler<T = DocumentKind> {
  kind: T;
  onCreateDocument: (args: CreateDocumentCallbackProps) => Promise<void>;
  onUpdateDocument: (args: UpdateDocumentCallbackProps) => Promise<void>;
}

export function createDocumentHandler<T extends DocumentKind>(config: {
  kind: T;
  onCreateDocument: (params: CreateDocumentCallbackProps) => Promise<string>;
  onUpdateDocument: (params: UpdateDocumentCallbackProps) => Promise<string>;
}): DocumentHandler<T> {
  return {
    kind: config.kind,
    onCreateDocument: async (args: CreateDocumentCallbackProps) => {
      const draftContent = await config.onCreateDocument({
        id: args.id,
        title: args.title,
        modelApiIdentifier: args.modelApiIdentifier,
        dataStream: args.dataStream,
        userId: args.userId,
      });

      await saveDocument({
        id: args.id,
        title: args.title,
        content: draftContent,
        createdAt: new Date(),
        kind: config.kind,
        userId: args.userId,
      });
    },
    onUpdateDocument: async (args: UpdateDocumentCallbackProps) => {
      const draftContent = await config.onUpdateDocument({
        description: args.description,
        document: args.document,
        modelApiIdentifier: args.modelApiIdentifier,
        dataStream: args.dataStream,
        userId: args.userId,
      });

      await saveDocument({
        id: args.document.id,
        title: args.document.title,
        content: draftContent,
        createdAt: new Date(),
        kind: config.kind,
        userId: args.userId,
      });
    },
  };
}
