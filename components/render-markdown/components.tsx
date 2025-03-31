import Link from 'next/link';
import { JSX } from 'react';

import { isInlineCode } from './utils';

import type { Element } from 'hast';
import type { ComponentType } from 'react';

type ExtraProps = {
  node?: Element;
};

export type Components = {
  [Key in keyof JSX.IntrinsicElements]?:
    | ComponentType<JSX.IntrinsicElements[Key] & ExtraProps>
    | keyof JSX.IntrinsicElements;
};

export const components: Partial<Components> = {
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
    const match = className?.match(/language-(\w+)/);
    const language = match ? match[1] : '';
    const isInline = node ? isInlineCode(node) : false;
    return isInline ? (
      <code className="not-prose rounded-md bg-gray-100 font-mono text-xs font-normal text-foreground dark:bg-zinc-800">
        {children}
      </code>
    ) : (
      <>
        <div className="flex h-10 flex-row items-center rounded-t-xl bg-muted p-4">
          <span className="font-mono text-xs text-foreground">{language}</span>
        </div>
        <div className="block overflow-x-auto p-4">
          <code className={`not-prose ${className}`} {...props}>
            {children}
          </code>
        </div>
      </>
    );
  },
};
