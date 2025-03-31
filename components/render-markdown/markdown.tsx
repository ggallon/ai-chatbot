import 'katex/dist/katex.min.css';

import { memo } from 'react';

import { MarkdownToReact } from './render';

export const Markdown = memo(function Markdown({
  children,
}: {
  children: string;
}) {
  return <MarkdownToReact>{children}</MarkdownToReact>;
});
