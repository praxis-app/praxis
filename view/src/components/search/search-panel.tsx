import { SearchContent } from '@/components/search/search-content';
import { Button } from '@/components/ui/button';
import {
  SEARCH_CHANNEL_PARAM,
  SEARCH_KINDS,
  SEARCH_KIND_PARAM,
  SEARCH_QUERY_PARAM,
} from '@/constants/search.constants';
import { opensInRightPanel } from '@/lib/search.utils';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { useSearchParams } from 'react-router-dom';

interface Props {
  onClose: () => void;
}

export const SearchPanel = ({ onClose }: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();

  const query = searchParams.get(SEARCH_QUERY_PARAM) || '';
  const filters = {
    channelId: searchParams.get(SEARCH_CHANNEL_PARAM) || undefined,
    kind: SEARCH_KINDS.find(
      (kind) => kind === searchParams.get(SEARCH_KIND_PARAM),
    ),
  };

  const updateSearchParams = (values: Record<string, string | undefined>) => {
    setSearchParams(
      (currentParams) => {
        const nextParams = new URLSearchParams(currentParams);
        for (const [key, value] of Object.entries(values)) {
          if (value) nextParams.set(key, value);
          else nextParams.delete(key);
        }
        return nextParams;
      },
      { replace: true, preventScrollReset: true, flushSync: true },
    );
  };

  return (
    <aside
      id="search-panel"
      data-testid="search-panel"
      aria-label={t('search.headers.title')}
      className="bg-background flex h-full min-w-0 flex-col"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && !event.defaultPrevented) {
          event.preventDefault();
          event.stopPropagation();
          onClose();
        }
      }}
    >
      <div className="flex h-13.75 shrink-0 items-center justify-between border-b px-4">
        <h2 className="font-semibold">{t('search.headers.title')}</h2>
        <Button
          variant="ghost"
          size="icon"
          aria-label={t('search.actions.close')}
          onClick={onClose}
        >
          <MdClose className="size-5" />
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 p-3">
        <p className="text-muted-foreground text-sm">
          {t('search.descriptions.boundedRecent')}
        </p>
        <SearchContent
          query={query}
          filters={filters}
          onQueryChange={(value) =>
            updateSearchParams({ [SEARCH_QUERY_PARAM]: value })
          }
          onFiltersChange={(value) =>
            updateSearchParams({
              [SEARCH_CHANNEL_PARAM]: value.channelId,
              [SEARCH_KIND_PARAM]: value.kind,
            })
          }
          onSelect={(result) => {
            if (opensInRightPanel(result.kind)) onClose();
          }}
        />
      </div>
    </aside>
  );
};
