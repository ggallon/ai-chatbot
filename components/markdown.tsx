import 'katex/dist/katex.min.css';
import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';

// Preprocess LaTeX equations to be rendered by KaTeX
// ref: https://github.com/remarkjs/react-markdown/issues/785
const preprocessLaTeX = (content: string) => {
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation) => `$$${equation}$$`,
  );
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation) => `$${equation}$`,
  );
  return inlineProcessedContent;
};

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components: Partial<Components> = {
    pre: ({ node, className, children, ...props }) => {
      return (
        <pre
          className="overflow-x-scroll bg-gray-100 dark:bg-zinc-800 my-0"
          {...props}
        >
          {children}
        </pre>
      );
    },
    code: ({ node, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      if (!match) {
        return (
          <code
            className="rounded-md text-foreground bg-gray-100 dark:bg-zinc-800 px-1 py-[0.15rem] font-mono text-xs font-normal before:hidden after:hidden"
            {...props}
          >
            {children}
          </code>
        );
      }

      return (
        <code className={`${match[1] ?? ''} text-foreground`}>{children}</code>
      );
    },
    a: ({ node, children, href, ...props }) => {
      return (
        <Link
          className="text-blue-500 hover:underline"
          target="_blank"
          rel="noreferrer"
          href={href ?? ''}
          {...props}
        >
          {children}
        </Link>
      );
    },
  };

  // Check if the content contains LaTeX patterns
  const containsLaTeX = /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/.test(
    children ?? '',
  );

  // Modify the content to render LaTeX equations if LaTeX patterns are found
  const processedData = preprocessLaTeX(children ?? '');

  if (containsLaTeX) {
    return (
      <ReactMarkdown
        rehypePlugins={[rehypeKatex]}
        remarkPlugins={[remarkGfm, remarkMath]}
        components={components}
      >
        {processedData}
      </ReactMarkdown>
    );
  }

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
