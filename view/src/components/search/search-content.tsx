import { api } from '@/client/api-client';
import { SearchFilters } from '@/components/search/search-filters';
import { SearchInput } from '@/components/search/search-input';
import { SearchResults } from '@/components/search/search-results';
import { useAuthData } from '@/hooks/use-auth-data';
import { useSearch } from '@/hooks/use-search';
import { useServerData } from '@/hooks/use-server-data';
import {
  getSearchResultTarget,
  opensInRightPanel,
  withSearchPanel,
} from '@/lib/search.utils';
import {
  type SearchFilters as SearchFiltersValue,
  type SearchResultRes,
} from '@/types/search.types';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface Props {
  onSelect: (result: SearchResultRes) => void;
  query: string;
  filters: SearchFiltersValue;
  onQueryChange: (query: string) => void;
  onFiltersChange: (filters: SearchFiltersValue) => void;
}

export const SearchContent = ({
  onSelect,
  query,
  filters,
  onQueryChange,
  onFiltersChange,
}: Props) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isRegistered } = useAuthData();
  const { serverId } = useServerData();

  const { data: channelsData } = useQuery({
    queryKey: ['servers', serverId, 'channels', 'joined'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getJoinedChannels(serverId);
    },
    enabled: !!serverId && isRegistered,
  });

  const {
    fetchNextPage,
    hasNextPage,
    isAccessError,
    isDebouncing,
    isError,
    isFetching,
    isFetchingNextPage,
    isQueryValid,
    normalizedQuery,
    refetch,
    results,
    searchCoverage,
  } = useSearch({ serverId, query, filters, enabled: true });

  const handleSelect = (result: SearchResultRes) => {
    const { pathname, search } = getSearchResultTarget(result);
    const target = new URLSearchParams(search);

    const nextParams = opensInRightPanel(result.kind)
      ? target
      : withSearchPanel(target, searchParams);

    onSelect(result);
    void navigate({ pathname, search: nextParams.toString() });
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <SearchInput value={query} onChange={onQueryChange} />

      <SearchFilters
        channels={channelsData?.channels || []}
        filters={filters}
        onChange={onFiltersChange}
      />

      <div className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
        <SearchResults
          results={results}
          coverage={searchCoverage}
          query={normalizedQuery}
          hasMore={!!hasNextPage}
          isAccessError={isAccessError}
          isError={isError}
          isFetchingNextPage={isFetchingNextPage}
          isLoading={
            isQueryValid &&
            (isDebouncing || (isFetching && results.length === 0))
          }
          isQueryValid={isQueryValid}
          onLoadMore={() => void fetchNextPage()}
          onRetry={() => void refetch()}
          onSelect={handleSelect}
        />
      </div>
    </div>
  );
};
