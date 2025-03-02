import { describe, it, expect } from 'vitest';

import {
  getFormatedChatTitle,
  MAX_TITLE_LENGTH,
} from './get-formated-chat-title';

describe('getFormatedChatTitle', () => {
  it(`should return title if <= ${MAX_TITLE_LENGTH}`, () => {
    const title = `A title less than ${MAX_TITLE_LENGTH} characters long`;
    const formatedTitle = getFormatedChatTitle({ title });
    expect(title.length).toBeLessThanOrEqual(MAX_TITLE_LENGTH);
    expect(title).toBe(formatedTitle);
  });

  it(`should return a shorted title with ellipsis if > ${MAX_TITLE_LENGTH}`, () => {
    const title = `A title greater than ${MAX_TITLE_LENGTH} characters long, with many characters.`;
    const formatedTitle = getFormatedChatTitle({ title });
    expect(title.length).toBeGreaterThan(MAX_TITLE_LENGTH);
    expect(formatedTitle).toContain('...');
    expect(formatedTitle).toHaveLength(MAX_TITLE_LENGTH + '...'.length);
  });
});
