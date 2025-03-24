import 'katex/dist/katex.min.css';

import Link from 'next/link';
import { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import rehypeHighlight from 'rehype-highlight';

import type { Element } from 'hast';

/**
 * from https://github.com/AVGVSTVS96/react-shiki/blob/cd6ce498b1a981f3b93407b02052f18d1e99a0c5/package/src/utils.ts#L37-L50
 * Function to determine if code is inline based on the presence of line breaks
 *
 * @example
 * const isInline = node && isInlineCode(node: Element)
 */
const isInlineCode = (node: Element): boolean => {
  const textContent = (node.children || [])
    .filter((child) => child.type === 'text')
    .map((child) => child.value)
    .join('');

  return !textContent.includes('\n');
};

const components: Partial<Components> = {
  a: ({ children, href }) => {
    return (
      <Link
        className="text-blue-500 hover:underline"
        target="_blank"
        rel="noreferrer"
        href={href ?? ''}
      >
        {children}
      </Link>
    );
  },
  code: ({ children, className, node, ...props }) => {
    // const match = className?.match(/language-(\w+)/);
    const isInline = node ? isInlineCode(node) : false;

    return isInline ? (
      <code className="not-prose rounded-md bg-gray-100 px-1 py-[0.15rem] font-mono text-xs font-normal text-foreground dark:bg-zinc-800">
        {children}
      </code>
    ) : (
      <code className={`not-prose ${className}`} {...props}>
        {children}
      </code>
    );
  },
};

// Preprocess LaTeX equations to be rendered by KaTeX
// ref: https://github.com/remarkjs/react-markdown/issues/785
const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation: string) => `$$${equation}$$`,
  );
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation: string) => `$${equation}$`,
  );
  return inlineProcessedContent;
};

export const Markdown = memo(function Markdown({
  children,
}: {
  children: string;
}) {
  // Check if the content contains LaTeX patterns
  const containsLaTeX = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/.test(children);
  if (containsLaTeX) {
    return (
      <ReactMarkdown rehypePlugins={[rehypeKatex]} remarkPlugins={[remarkMath]}>
        {preprocessLaTeX(children)}
      </ReactMarkdown>
    );
  }

  return (
    <ReactMarkdown
      rehypePlugins={[rehypeHighlight]}
      remarkPlugins={[remarkGfm]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
});
