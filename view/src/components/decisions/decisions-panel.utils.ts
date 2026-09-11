import { type ActiveDecisionRes } from '@/types/decision.types';
import { type InfiniteData, type QueryClient } from '@tanstack/react-query';

export const getActiveDecisionsQueryKey = (serverId?: string) => [
  'servers',
  serverId,
  'decisions',
];

export const updateActiveDecisionCache = (
  queryClient: QueryClient,
  serverId: string | undefined,
  decisionId: string,
  update: (decision: ActiveDecisionRes) => ActiveDecisionRes | undefined,
) => {
  if (!serverId) {
    return false;
  }

  let found = false;
  queryClient.setQueryData<InfiniteData<{ decisions: ActiveDecisionRes[] }>>(
    getActiveDecisionsQueryKey(serverId),
    (current) => {
      if (!current) {
        return current;
      }

      const pages = current.pages.map((page) => {
        let pageChanged = false;
        const decisions = page.decisions.flatMap((decision) => {
          if (decision.id !== decisionId) {
            return [decision];
          }
          found = true;
          pageChanged = true;
          const updatedDecision = update(decision);
          return updatedDecision ? [updatedDecision] : [];
        });
        return pageChanged ? { ...page, decisions } : page;
      });

      return found ? { ...current, pages } : current;
    },
  );
  return found;
};
