import { SearchContent } from '@/components/search/search-content';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { type SearchFilters } from '@/types/search.types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultChannelId?: string;
}

export const SearchDialog = ({
  open,
  onOpenChange,
  defaultChannelId,
}: Props) => {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({
    channelId: defaultChannelId,
  });

  const { t } = useTranslation();

  useEffect(() => {
    if (open) {
      setQuery('');
      setFilters({ channelId: defaultChannelId });
    }
  }, [open, defaultChannelId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="search-dialog">
        <DialogHeader>
          <DialogTitle>{t('search.headers.title')}</DialogTitle>
          <DialogDescription>
            {t('search.descriptions.boundedRecent')}
          </DialogDescription>
        </DialogHeader>
        <SearchContent
          query={query}
          filters={filters}
          onQueryChange={setQuery}
          onFiltersChange={setFilters}
          onSelect={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
