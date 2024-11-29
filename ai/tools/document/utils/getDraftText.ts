import type { CoreTool, DataStreamWriter, TextStreamPart } from "ai";

type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>;

export async function getDraftText({
  fullStream,
  dataStream,
}: {
  fullStream: AsyncIterableStream<
    TextStreamPart<Record<string, CoreTool<any, any>>>
  >;
  dataStream: DataStreamWriter;
}) {
  let draftText = "";
  for await (const delta of fullStream) {
    const { type } = delta;

    if (type === "text-delta") {
      const { textDelta } = delta;

      draftText += textDelta;
      dataStream.writeData({
        type: "text-delta",
        content: textDelta,
      });
    }
  }

  return draftText;
}
