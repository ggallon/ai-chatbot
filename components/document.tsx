import { FileIcon, LoaderIcon, MessageIcon, PencilEditIcon } from "./icons";

import type { UIBlock } from "./block";
import type { SetStateAction } from "react";

const ACTION_TYPES = {
  create: { name: "Creating", icon: <FileIcon /> },
  update: { name: "Updating", icon: <PencilEditIcon /> },
  "request-suggestions": { name: "Adding suggestions", icon: <MessageIcon /> },
};

function ToolCallAction({
  className,
  title,
  type,
}: {
  className: string;
  title: string;
  type: "create" | "update" | "request-suggestions";
}) {
  return (
    <>
      <div className={className}>{ACTION_TYPES[type].icon ?? null}</div>
      <div>
        {ACTION_TYPES[type].name ?? null} {title}
      </div>
    </>
  );
}

interface DocumentToolResultProps {
  type: "create" | "update" | "request-suggestions";
  result: any;
  block: UIBlock;
  setBlock: (value: SetStateAction<UIBlock>) => void;
}

export function DocumentToolResult({
  type,
  result,
  block,
  setBlock,
}: DocumentToolResultProps) {
  return (
    <div
      className="flex w-fit cursor-pointer flex-row items-start gap-3 rounded-xl border bg-background px-3 py-2"
      onClick={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();

        setBlock({
          documentId: result.id,
          content: "",
          title: result.title,
          isVisible: true,
          status: "idle",
          boundingBox: {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          },
        });
      }}
    >
      <ToolCallAction
        className="mt-1 text-muted-foreground"
        type={type}
        title={result.title}
      />
    </div>
  );
}

interface DocumentToolCallProps {
  type: "create" | "update" | "request-suggestions";
  args: any;
}

export function DocumentToolCall({ type, args }: DocumentToolCallProps) {
  return (
    <div className="flex w-fit flex-row items-start justify-between gap-3 rounded-xl border px-3 py-2">
      <div className="flex flex-row items-start gap-3">
        <ToolCallAction
          className="mt-1 text-zinc-500"
          type={type}
          title={args.title}
        />
      </div>
      <div className="mt-1 animate-spin">
        <LoaderIcon />
      </div>
    </div>
  );
}
