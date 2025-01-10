import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
      console.log('className', className);
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
