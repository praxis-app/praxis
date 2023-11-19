import { Logger } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

const logTimeMap: Record<string, number> = {};

/**
 * Log the time similar to `console.time` and `console.timeEnd`,
 * but with the ability to save output to a log file
 */
export const logTime = (identifier: string, logger: Logger) => {
  if (logTimeMap[identifier]) {
    const end = performance.now();
    const message = `${identifier}: ${Math.round(
      end - logTimeMap[identifier],
    )}ms`;
    logger.log(message);

    delete logTimeMap[identifier];
  } else {
    logTimeMap[identifier] = performance.now();
  }
};

/**
 * Strip all HTML tags from a string
 */
export const sanitizeText = (dirty: string) =>
  sanitizeHtml(dirty, { allowedTags: [] });
