'use client';

import { motion } from 'motion/react';

import { SparklesIcon } from './icons';

export const ThinkingMessage = () => {
  return (
    <motion.div
      className="group/message mx-auto w-full max-w-3xl px-4"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
    >
      <div className="flex w-full gap-4 rounded-xl">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full ring-1 ring-border">
          <SparklesIcon size={12} />
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};
