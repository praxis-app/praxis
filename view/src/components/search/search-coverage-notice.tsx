import { formatDate } from '@/lib/time.utils';
import { type SearchCoverageRes } from '@/types/search.types';
import { useTranslation } from 'react-i18next';

interface Props {
  coverage: SearchCoverageRes;
}

export const SearchCoverageNotice = ({ coverage }: Props) => {
  const { t } = useTranslation();

  return (
    <div
      data-testid="search-coverage"
      className="text-muted-foreground space-y-1 text-xs"
    >
      <p>
        {t('search.coverage.window', {
          start: formatDate(coverage.windowStart),
          end: formatDate(coverage.windowEnd),
        })}
      </p>
    </div>
  );
};
