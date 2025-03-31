import type { Element } from 'hast';

const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;
export function defaultUrlTransform(
  value: string,
  _key: string,
  _node: Readonly<Element>,
) {
  // Same as:
  // <https://github.com/micromark/micromark/blob/929275e/packages/micromark-util-sanitize-uri/dev/index.js#L34>
  // But without the `encode` part.
  const colon = value.indexOf(':');
  const questionMark = value.indexOf('?');
  const numberSign = value.indexOf('#');
  const slash = value.indexOf('/');

  if (
    // If there is no protocol, it’s relative.
    colon === -1 ||
    // If the first colon is after a `?`, `#`, or `/`, it’s not a protocol.
    (slash !== -1 && colon > slash) ||
    (questionMark !== -1 && colon > questionMark) ||
    (numberSign !== -1 && colon > numberSign) ||
    // It is a protocol, it should be allowed.
    safeProtocol.test(value.slice(0, colon))
  ) {
    return value;
  }

  return '';
}

/**
 * from https://github.com/AVGVSTVS96/react-shiki/blob/cd6ce498b1a981f3b93407b02052f18d1e99a0c5/package/src/utils.ts#L37-L50
 * Function to determine if code is inline based on the presence of line breaks
 *
 * @example
 * const isInline = node && isInlineCode(node: Element)
 */
export function isInlineCode(node: Element) {
  const textContent = (node.children || [])
    .filter((child) => child.type === 'text')
    .map((child) => child.value)
    .join('');

  return !textContent.includes('\n');
}

// For processing openai or others latex.
// Replace block-level LaTeX delimiters \[ \] with $$ $$
// ref: https://github.com/remarkjs/react-markdown/issues/785#issuecomment-1966495891
export function preprocessLaTeX(content: string) {
  const blockProcessedContent = content.replace(
    /\\\[([\s\S]*?)\\\]/g,
    (_, equation: string) => `$$${equation}$$`,
  );
  const inlineProcessedContent = blockProcessedContent.replace(
    /\\\(([\s\S]*?)\\\)/g,
    (_, equation: string) => `$${equation}$`,
  );
  return inlineProcessedContent;
}

export function stringContainsLaTeX(content: string) {
  // Check if the content contains LaTeX patterns
  return /\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)/.test(content);
}
