import { SearchCoverageNotice } from '@/components/search/search-coverage-notice';
import { SearchResultItem } from '@/components/search/search-result-item';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SEARCH_MIN_QUERY_LENGTH } from '@/constants/search.constants';
import {
  type SearchCoverageRes,
  type SearchResultRes,
} from '@/types/search.types';
import { useTranslation } from 'react-i18next';

interface Props {
  results: SearchResultRes[];
  coverage?: SearchCoverageRes;
  query: string;
  hasMore: boolean;
  isAccessError: boolean;
  isError: boolean;
  isFetchingNextPage: boolean;
  isLoading: boolean;
  isQueryValid: boolean;
  onLoadMore: () => void;
  onRetry: () => void;
  onSelect: (result: SearchResultRes) => void;
}

export const SearchResults = ({
  results,
  coverage,
  query,
  hasMore,
  isAccessError,
  isError,
  isFetchingNextPage,
  isLoading,
  isQueryValid,
  onLoadMore,
  onRetry,
  onSelect,
}: Props) => {
  const { t } = useTranslation();

  if (!isQueryValid) {
    return (
      <p className="text-muted-foreground py-6 text-center text-sm">
        {t('search.prompts.minLength', { count: SEARCH_MIN_QUERY_LENGTH })}
      </p>
    );
  }

  if (isLoading) {
    return (
      <div data-testid="search-loading" className="space-y-2">
        {[0, 1, 2].map((index) => (
          <Skeleton key={index} className="h-16 w-full rounded-md" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-3 py-6 text-center"
      >
        <p className="text-muted-foreground text-sm">
          {isAccessError
            ? t('search.errors.accessChanged')
            : t('search.errors.unavailable')}
        </p>
        <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
          {t('actions.refresh')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      {results.length === 0 ? (
        <p
          data-testid="search-empty"
          className="text-muted-foreground py-6 text-center text-sm"
        >
          {t('search.prompts.noResults')}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {results.map((result) => (
            <SearchResultItem
              key={`${result.kind}-${result.id}`}
              result={result}
              query={query}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}

      {hasMore && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-center"
          disabled={isFetchingNextPage}
          onClick={onLoadMore}
        >
          {isFetchingNextPage
            ? t('search.actions.loadingMore')
            : t('search.actions.loadMore')}
        </Button>
      )}

      {coverage && <SearchCoverageNotice coverage={coverage} />}
    </div>
  );
};
