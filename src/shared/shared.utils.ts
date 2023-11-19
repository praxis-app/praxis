import { Logger } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

const timings: { [key: string]: number } = {};

export const logTime = (identifier: string, logger: Logger) => {
  if (timings[identifier]) {
    const end = performance.now();
    const message = `${identifier}: ${Math.round(end - timings[identifier])}ms`;
    logger.log(message);

    delete timings[identifier];
  } else {
    timings[identifier] = performance.now();
  }
};

/**
 * Strip all HTML tags from a string
 */
export const sanitizeText = (dirty: string) =>
  sanitizeHtml(dirty, { allowedTags: [] });
