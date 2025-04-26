'use client';

import { ChevronDown, ChevronRight, CircleCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

import { LoaderIcon } from './icons';
import { Markdown } from './render-markdown/markdown';

interface MessageReasoningProps {
  isLoading: boolean;
  reasoning: string;
}

export function MessageReasoning({
  isLoading,
  reasoning,
}: MessageReasoningProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const variants = {
    collapsed: {
      height: 0,
      opacity: 0,
      marginTop: 0,
      marginBottom: 0,
    },
    expanded: {
      height: 'auto',
      opacity: 1,
      marginTop: '1rem',
      marginBottom: '0.5rem',
    },
  };

  return (
    <div className="flex flex-col">
      {isLoading ? (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">Reasoning</div>
          <div className="animate-spin">
            <LoaderIcon />
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center gap-2">
          <div className="font-medium">Reasoned for a few seconds</div>
          <button
            type="button"
            className="cursor-pointer"
            onClick={() => {
              setIsExpanded(!isExpanded);
            }}
          >
            {isExpanded ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>
      )}

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="content"
            initial="collapsed"
            animate="expanded"
            exit="collapsed"
            variants={variants}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
            className="flex flex-col gap-2"
          >
            <div className="flex w-full items-start gap-2 overflow-clip">
              <div className="flex h-full w-4 shrink-0 flex-col items-center gap-2">
                <div className="flex h-5 shrink-0 items-center justify-center">
                  <div className="size-1.5 rounded-full bg-foreground"></div>
                </div>
                <div className="h-full w-px rounded-full bg-foreground"></div>
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-0 prose-ol:my-0 prose-ul:my-0">
                <Markdown>{reasoning}</Markdown>
              </div>
            </div>

            {!isLoading && (
              <div className="flex w-full items-start gap-2 overflow-clip">
                <div className="flex h-full w-4 shrink-0 flex-col items-center justify-center gap-2">
                  <CircleCheck size={14} />
                </div>
                <div className="text-sm">Completed</div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
