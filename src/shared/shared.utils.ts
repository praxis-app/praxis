import * as sanitizeHtml from 'sanitize-html';

/**
 * Strip all HTML tags from a string
 */
export const sanitizeText = (dirty: string) =>
  sanitizeHtml(dirty, { allowedTags: [] });
