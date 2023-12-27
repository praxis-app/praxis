import { Logger } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';

const logTimeMap: Record<string, number> = {};

/**
 * Log time similar to `console.time` and `console.timeEnd`,
 * but with the ability to save output to a log file
 */
export const logTime = (label: string, logger: Logger) => {
  if (!logTimeMap[label]) {
    logTimeMap[label] = performance.now();
    return;
  }
  const end = performance.now();
  const time = Math.round(end - logTimeMap[label]);
  const message = `${label}: ${time}ms`;

  logger.log(message);
  delete logTimeMap[label];
};

/**
 * Strip all HTML tags from a string
 */
export const sanitizeText = (dirty: string) =>
  sanitizeHtml(dirty, { allowedTags: [] });

/**
 * Paginate an array - page 0 is the first page
 */
export const paginate = <T>(array: T[], offset: number, limit: number) =>
  array.slice(offset, limit + offset);
