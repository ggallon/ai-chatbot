import { unreachable } from 'devlop';
import { toJsxRuntime } from 'hast-util-to-jsx-runtime';
import { urlAttributes } from 'html-url-attributes';
import { Fragment, jsx, jsxs } from 'react/jsx-runtime';
import rehypeKatex from 'rehype-katex';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { visit } from 'unist-util-visit';
import { VFile } from 'vfile';

import { components } from './components';
import {
  defaultUrlTransform,
  preprocessLaTeX,
  stringContainsLaTeX,
} from './utils';

// from https://github.com/remarkjs/react-markdown/blob/main/lib/index.js

import type { Doctype, ElementContent, Nodes, Root } from 'hast';
import type { Props as HastUtilToJsxRuntimeProps } from 'hast-util-to-jsx-runtime';
import type { VisitorResult } from 'unist-util-visit';

interface MarkdownToReactOptions {
  children: string;
}

export function MarkdownToReact({ children }: MarkdownToReactOptions) {
  const containsLaTeX = stringContainsLaTeX(children);
  const processor = createProcessor(containsLaTeX);
  const file = createFile({ children, containsLaTeX });
  return post(processor.runSync(processor.parse(file), file));
}

export async function MarkdownToReactAsync({
  children,
}: MarkdownToReactOptions) {
  const containsLaTeX = stringContainsLaTeX(children);
  const processor = createProcessor(containsLaTeX);
  const file = createFile({ children, containsLaTeX });
  const tree = await processor.run(processor.parse(file), file);
  return post(tree);
}

function createProcessor(containsLaTeX: boolean) {
  const processor = unified()
    .use(remarkParse)
    .use(containsLaTeX ? [remarkMath] : [remarkGfm])
    .use(remarkRehype, {
      allowDangerousHtml: true,
    })
    .use(containsLaTeX ? [rehypeKatex] : [rehypeHighlight]);

  return processor;
}

function createFile({
  children,
  containsLaTeX,
}: {
  children?: string;
  containsLaTeX: boolean;
}) {
  let content = children ?? '';
  const file = new VFile();

  if (containsLaTeX) {
    content = preprocessLaTeX(content);
  }

  if (typeof content === 'string') {
    file.value = content;
  } else {
    unreachable(
      'Unexpected value `' +
        content +
        '` for `children` prop, expected `string`',
    );
  }

  return file;
}

function post(tree: Nodes) {
  /*
   * Array<string> — tag names to disallow
   */
  //const disallowedElements = [];
  /*
   *  ignore HTML in markdown completely
   */
  //const skipHtml = false;
  /*
   * extract (unwrap) what’s in disallowed elements;
   * normally when say strong is not allowed,
   * it and it’s children are dropped, with unwrapDisallowed
   * the element itself is replaced by its children
   */
  //const unwrapDisallowed = false;

  visit(tree, transform);

  return toJsxRuntime(tree, {
    Fragment,
    components,
    ignoreInvalidStyle: true,
    jsx,
    jsxs,
    passKeys: true,
    passNode: true,
  });

  function transform(
    node: Doctype | ElementContent | Root,
    index?: number,
    parent?: HastUtilToJsxRuntimeProps['node'] | Root,
  ): VisitorResult {
    if (node.type === 'raw' && parent && typeof index === 'number') {
      /*
      if (skipHtml) {
        parent.children.splice(index, 1);
      } else {
        parent.children[index] = { type: 'text', value: node.value };
      }
       */
      parent.children[index] = { type: 'text', value: node.value };

      return index;
    }

    if (node.type === 'element') {
      let key: string;

      for (key in urlAttributes) {
        if (
          Object.hasOwn(urlAttributes, key) &&
          Object.hasOwn(node.properties, key)
        ) {
          const value = node.properties[key];
          const test = urlAttributes[key];
          if (test === null || test.includes(node.tagName)) {
            node.properties[key] = defaultUrlTransform(
              String(value ?? ''),
              key,
              node,
            );
          }
        }
      }
    }

    /* for disallowedElements
    if (node.type === 'element') {
      const remove = disallowedElements
        ? disallowedElements.includes(node.tagName)
        : false;

      if (remove && parent && typeof index === 'number') {
        if (unwrapDisallowed) {
          parent.children.splice(index, 1, ...node.children);
        } else {
          parent.children.splice(index, 1);
        }

        return index;
      }
    }
    */
  }
}
