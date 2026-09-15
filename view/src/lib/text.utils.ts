import { marked } from 'marked';
import { URL_REGEX } from '../constants/shared.constants';

const SPACER_STYLE = 'margin-bottom: -15px;';
const SAFE_URL_PROTOCOLS = /^(?:https?|mailto):/i;

const ALLOWED_ATTRIBUTES: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'title'],
  div: ['style'],
};

const ALLOWED_TAGS = new Set([
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'img',
  'li',
  'ol',
  'pre',
  'span',
  'strong',
  'ul',
]);

export const truncate = (text: string, length = 30) => {
  const omission = '...';
  if (text.length <= length) {
    return text;
  }
  if (length <= omission.length) {
    return omission;
  }
  return text.slice(0, length - omission.length) + omission;
};

const escapeMarkup = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const parseMarkdownText = async (text: string) => {
  const spacer = `<div style="${SPACER_STYLE}"></div>`;
  const withNewLines = escapeMarkup(text).replace(/\n(?=\n)/g, spacer);
  const parsedText = await marked.parse(withNewLines, { pedantic: true });
  return parsedText.replace(/<\/?p>/g, '');
};

const isAttributeAllowed = (element: Element, name: string, value: string) => {
  if (!ALLOWED_ATTRIBUTES[element.tagName.toLowerCase()]?.includes(name)) {
    return false;
  }
  if (name === 'href' || name === 'src') {
    return SAFE_URL_PROTOCOLS.test(value.trim());
  }
  if (name === 'style') {
    return value === SPACER_STYLE;
  }
  return true;
};

const parseSafeFragment = (html: string) => {
  const parsed = new DOMParser().parseFromString(html, 'text/html');

  for (const element of parsed.body.querySelectorAll('*')) {
    if (!ALLOWED_TAGS.has(element.tagName.toLowerCase())) {
      element.remove();
      continue;
    }
    for (const { name, value } of [...element.attributes]) {
      if (!isAttributeAllowed(element, name, value)) {
        element.removeAttribute(name);
      }
    }
  }

  const fragment = document.createDocumentFragment();
  fragment.append(...parsed.body.childNodes);
  return fragment;
};

const createLink = (url: string, urlTrimSize?: number) => {
  const link = document.createElement('a');
  link.href = url;
  link.rel = 'noopener noreferrer';
  link.target = '_blank';
  link.textContent = urlTrimSize ? truncate(url, urlTrimSize) : url;
  return link;
};

const urlifyTextNodes = (root: DocumentFragment, urlTrimSize?: number) => {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  // TreeWalker has no iterator, and nodes are only collected here, not
  // modified, so the walk ends at the last text node
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (!node.parentElement?.closest('a')) {
      textNodes.push(node);
    }
  }

  for (const node of textNodes) {
    const parts = node.data.split(URL_REGEX);
    if (parts.length === 1) {
      continue;
    }
    const replacement = document.createDocumentFragment();
    for (const [index, part] of parts.entries()) {
      if (index % 2 === 1) {
        replacement.append(createLink(part, urlTrimSize));
      } else if (part) {
        replacement.append(part);
      }
    }
    node.replaceWith(replacement);
  }
};

const convertBoldToSpan = (root: DocumentFragment) => {
  for (const element of root.querySelectorAll('b, strong')) {
    const span = document.createElement('span');
    span.style.fontFamily = 'Inter';
    span.style.fontWeight = '500';
    span.append(...element.childNodes);
    element.replaceWith(span);
  }
};

export const formatUserText = async (text: string, urlTrimSize?: number) => {
  const markdown = await parseMarkdownText(text);
  const fragment = parseSafeFragment(markdown);

  urlifyTextNodes(fragment, urlTrimSize);
  convertBoldToSpan(fragment);

  const container = document.createElement('div');
  container.append(fragment);
  return container.innerHTML;
};
