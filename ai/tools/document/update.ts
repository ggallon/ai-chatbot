import { streamText, tool, type DataStreamWriter } from "ai";
import { z } from "zod";

import { customModel } from "@/ai";
import { getDocumentById, saveDocument } from "@/db/queries/document";

import { getDraftText } from "./utils/getDraftText";

import type { Model } from "@/ai/models";

export const updateDocument = ({
  model,
  dataStream,
  userId,
}: {
  model: Model;
  dataStream: DataStreamWriter;
  userId: string;
}) =>
  tool({
    description: "Update a document with the given description",
    parameters: z.object({
      id: z.string().describe("The ID of the document to update"),
      description: z
        .string()
        .describe("The description of changes that need to be made"),
    }),
    execute: async ({ id, description }) => {
      const document = await getDocumentById({ id });
      if (!document?.content) {
        return {
          error: "Document not found",
        };
      }

      const { content: currentContent } = document;

      dataStream.writeData({ type: "clear", content: document.title });

      const { fullStream } = streamText({
        model: customModel(model.apiIdentifier),
        system:
          "You are a helpful writing assistant. Based on the description, please update the piece of writing.",
        experimental_providerMetadata: {
          openai: {
            prediction: { type: "content", content: currentContent },
          },
        },
        messages: [
          { role: "user", content: description },
          { role: "user", content: currentContent },
        ],
      });

      const draftText = await getDraftText({ fullStream, dataStream });

      dataStream.writeData({ type: "finish", content: "" });

      await saveDocument({
        id,
        title: document.title,
        content: draftText,
        userId,
      });

      return {
        id,
        title: document.title,
        content: "The document has been updated successfully.",
      };
    },
  });
