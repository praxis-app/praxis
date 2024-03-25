import { Logger } from '@nestjs/common';
import * as sanitizeHtml from 'sanitize-html';
import { DEFAULT_PAGE_SIZE } from './common.constants';

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
 * Strip all HTML tags from a string and trim any whitespace
 */
export const sanitizeText = (dirty?: string) =>
  sanitizeHtml(dirty?.trim() || '', { allowedTags: [] });

/**
 * Normalize text by trimming whitespace and converting to lowercase
 */
export const normalizeText = (text: string) => {
  return text.trim().toLowerCase();
};

export const paginate = <T extends { createdAt: Date }>(
  array: T[],
  offset: number,
  limit = DEFAULT_PAGE_SIZE,
) => array.slice(offset, offset + limit);
