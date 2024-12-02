"use client";

import { motion } from "motion/react";
import { memo } from "react";

import { Button } from "./ui/button";

interface SuggestedActionsProps {
  show: boolean;
  chatId: string;
  append: (action: string) => Promise<string | null | undefined>;
}

export const SuggestedActions = memo(
  function SuggestedActions({ show, chatId, append }: SuggestedActionsProps) {
    const suggestedActions = [
      {
        id: 1,
        title: "What is the weather",
        label: "in San Francisco?",
        action: "What is the weather in San Francisco?",
      },
      {
        id: 2,
        title: "Help me draft an essay",
        label: "about Silicon Valley",
        action: "Help me draft a short essay about Silicon Valley",
      },
    ];

    return show ? (
      <div className="grid w-full gap-2 sm:grid-cols-2">
        {suggestedActions.map((suggestedAction, index) => (
          <motion.div
            className={index > 1 ? "hidden sm:block" : "block"}
            key={`action-${suggestedAction.id}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
          >
            <Button
              variant="ghost"
              onClick={() => {
                window.history.replaceState({}, "", `/chat/${chatId}`);
                append(suggestedAction.action);
              }}
              className="h-auto w-full flex-1 items-start justify-start gap-1 rounded-xl border px-4 py-3.5 text-left text-sm sm:flex-col"
            >
              <span className="font-medium">{suggestedAction.title}</span>
              <span className="text-muted-foreground">
                {suggestedAction.label}
              </span>
            </Button>
          </motion.div>
        ))}
      </div>
    ) : null;
  },
  (oldProps, newProps) =>
    oldProps.show === newProps.show && oldProps.chatId === newProps.chatId
);
