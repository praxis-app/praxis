import * as sanitizeHtml from 'sanitize-html';

const timings: { [key: string]: number } = {};

export const logTime = (identifier: string) => {
  if (timings[identifier]) {
    // The timer had already started, mark the time now and subtract the time
    // of the start to get the duration:
    const end = performance.now();
    console.log(`${identifier}: ${Math.round(end - timings[identifier])}ms`);

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
