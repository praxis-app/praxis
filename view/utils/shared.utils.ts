import { t } from 'i18next';
import { marked } from 'marked';
import { isValidElement, ReactNode } from 'react';
import { animateScroll } from 'react-scroll';
import { SCROLL_DURATION, URL_REGEX } from '../constants/shared.constants';
import { toastVar } from '../graphql/cache';

/**
 * Returns whether or not a given node can be successfully rendered.
 * Useful for checking whether a component has been passed any children.
 *
 * TODO: Determine whether this is still needed for ItemMenu
 */
export const isRenderable = (node: ReactNode): boolean => {
  switch (typeof node) {
    case 'string':
    case 'number':
      return true;
    default:
      if (Array.isArray(node) && node.length) {
        return Boolean(node.reduce((a, b) => a && isRenderable(b), true));
      }
      return isValidElement(node);
  }
};

export const isValidUrl = (str: string) => {
  let url: URL | undefined;
  try {
    url = new URL(str);
  } catch {
    return false;
  }
  return url.protocol === 'http:' || url.protocol === 'https:';
};

export const urlifyText = (text: string) =>
  text.replace(URL_REGEX, (url) => {
    return (
      '<a href="' +
      url +
      '" rel="noopener noreferrer" target="_blank" style="color:#e4e6ea;">' +
      url +
      '</a>'
    );
  });

export const parseMarkdownText = async (text: string) => {
  const parsedText = await marked.parse(text);
  return parsedText.replace(/<\/?p>/g, '');
};

export const convertBoldToSpan = (text: string) =>
  text
    .replace(/<b?strong>/g, '<span style="font-family: Inter Bold;">')
    .replace(/<\/b?strong>/g, '</span>');

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const waitFor = (conditionFn: () => boolean, ms = 250) => {
  const poll = (resolve: (_?: unknown) => void) => {
    if (conditionFn()) {
      resolve();
    } else {
      setTimeout(() => poll(resolve), ms);
    }
  };
  return new Promise(poll);
};

export const inDevToast = () => {
  toastVar({
    status: 'info',
    title: t('prompts.inDev'),
  });
};

export const scrollTop = () => {
  const options = { smooth: true, duration: SCROLL_DURATION };
  animateScroll.scrollToTop(options);
};

export const getRandomString = () =>
  Math.random()
    .toString(36)
    .slice(2, 10)
    .split('')
    .map((c) => (Math.random() < 0.5 ? c : c.toUpperCase()))
    .join('');

export const getTypedKeys = <T>(obj: T): (keyof T)[] =>
  Object.keys(obj as object) as (keyof T)[];
