import { streamText, tool, type DataStreamWriter } from "ai";
import { z } from "zod";

import { customModel } from "@/ai";
import { generateUUID } from "@/lib/utils/uuid";
import { saveDocument } from "@/db/queries/document";

import type { Model } from "@/ai/models";

import { getDraftText } from "./utils/getDraftText";

export const createDocument = ({
  model,
  dataStream,
  userId,
}: {
  model: Model;
  dataStream: DataStreamWriter;
  userId: string;
}) =>
  tool({
    description: "Create a document for a writing activity",
    parameters: z.object({ title: z.string() }),
    execute: async ({ title }) => {
      const id = generateUUID();

      dataStream.writeData({ type: "id", content: id });
      dataStream.writeData({ type: "title", content: title });
      dataStream.writeData({ type: "clear", content: "" });

      const { fullStream } = streamText({
        model: customModel(model.apiIdentifier),
        system:
          "Write about the given topic. Markdown is supported. Use headings wherever appropriate.",
        prompt: title,
      });

      const draftText = await getDraftText({ fullStream, dataStream });

      dataStream.writeData({ type: "finish", content: "" });

      await saveDocument({
        id,
        title,
        content: draftText,
        userId,
      });

      return {
        id,
        title,
        content: "A document was created and is now visible to the user.",
      };
    },
  });
