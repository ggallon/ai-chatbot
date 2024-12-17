'use client';

import { useMemo, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';

import type { UIBlock } from '@/components/block';

export function useBlock() {
  const { width: windowWidth = 1920, height: windowHeight = 1080 } =
    useWindowSize();

  const initialBlock: UIBlock = useMemo(
    () => ({
      documentId: 'init',
      content: '',
      kind: 'text',
      title: '',
      status: 'idle', // Ensure this matches the allowed union type
      isVisible: false,
      boundingBox: {
        top: windowHeight / 4,
        left: windowWidth / 4,
        width: 250,
        height: 50,
      },
    }),
    [windowWidth, windowHeight],
  );

  return useState<UIBlock>(initialBlock);
}
