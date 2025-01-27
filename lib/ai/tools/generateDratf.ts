import type { DataStreamWriter, TextStreamPart, ToolSet } from 'ai';

type AsyncIterableStream<T> = AsyncIterable<T> & ReadableStream<T>;

export async function generateDraftText({
  fullStream,
  dataStream,
}: {
  fullStream: AsyncIterableStream<TextStreamPart<ToolSet>>;
  dataStream: DataStreamWriter;
}) {
  const draftTextArray: string[] = [];

  for await (const delta of fullStream) {
    if (delta.type === 'text-delta') {
      draftTextArray.push(delta.textDelta);
      dataStream.writeData({
        type: 'text-delta',
        content: delta.textDelta,
      });
    }
  }

  return draftTextArray.join('');
}
