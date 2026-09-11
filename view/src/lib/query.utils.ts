import { type QueryKey } from '@tanstack/react-query';

export const anchoredQueryKey = (baseQueryKey: QueryKey, anchorId?: string) =>
  anchorId ? [...baseQueryKey, 'around', anchorId] : baseQueryKey;
