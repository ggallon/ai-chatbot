import type {
  DataStreamWriter,
  ObjectStreamPart,
  TextStreamPart,
  ToolSet,
} from 'ai';

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

export async function generateDraftSheet({
  fullStream,
  dataStream,
}: {
  fullStream: AsyncIterableStream<
    ObjectStreamPart<{
      csv?: string;
    }>
  >;
  dataStream: DataStreamWriter;
}) {
  let draftSheet = '';

  for await (const delta of fullStream) {
    if (delta.type === 'object' && delta.object.csv) {
      draftSheet = delta.object.csv;
      dataStream.writeData({
        type: 'sheet-delta',
        content: delta.object.csv,
      });
    }
  }

  return draftSheet;
}
