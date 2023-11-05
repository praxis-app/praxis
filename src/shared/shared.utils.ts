import sanitizeHtml from 'sanitize-html';

const SANITIZE_TEXT_OPTIONS = {
  allowedTags: ['a'],
  allowedAttributes: { a: ['href', 'rel', 'target', 'style'] },
};

export const sanitizeText = (dirty: string) =>
  sanitizeHtml(dirty, SANITIZE_TEXT_OPTIONS);
