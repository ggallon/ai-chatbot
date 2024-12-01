import { Chat } from "@/components/chat";
import { getSelectedModelId } from "@/lib/utils/get-selected-model-id";
import { generateUUID } from "@/lib/utils/uuid";

export default async function Page() {
  const id = generateUUID();
  const selectedModelId = await getSelectedModelId();

  return (
    <Chat
      key={id}
      id={id}
      initialMessages={[]}
      selectedModelId={selectedModelId}
    />
  );
}
