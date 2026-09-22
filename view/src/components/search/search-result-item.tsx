import { Badge } from '@/components/ui/badge';
import { splitExcerptForHighlight } from '@/lib/search.utils';
import { formatDate } from '@/lib/time.utils';
import { type SearchResultRes } from '@/types/search.types';
import { useTranslation } from 'react-i18next';
import { MdPhone, MdTag } from 'react-icons/md';

interface Props {
  result: SearchResultRes;
  query: string;
  onSelect: (result: SearchResultRes) => void;
}

export const SearchResultItem = ({ result, query, onSelect }: Props) => {
  const { t } = useTranslation();

  const authorName = result.author.displayName || result.author.name;
  const segments = splitExcerptForHighlight(result.excerpt, query);

  return (
    <li>
      <button
        type="button"
        data-testid="search-result"
        data-search-result-id={result.id}
        onClick={() => onSelect(result)}
        className="hover:bg-accent focus-visible:ring-ring w-full cursor-pointer rounded-md border px-3 py-2.5 text-left focus-visible:ring-2 focus-visible:outline-hidden"
      >
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          <Badge variant="secondary">{t(`search.kinds.${result.kind}`)}</Badge>
          <span className="inline-flex items-center gap-1">
            <MdTag aria-hidden="true" className="size-3.5" />
            {result.channelName}
          </span>
          {result.callId && (
            <span className="inline-flex items-center gap-1">
              <MdPhone aria-hidden="true" className="size-3.5" />
              {t('search.labels.inCall')}
            </span>
          )}
          <span aria-hidden="true">·</span>
          <span>{authorName}</span>
          <span aria-hidden="true">·</span>
          <time dateTime={result.createdAt}>
            {formatDate(result.createdAt)}
          </time>
        </div>

        <p className="mt-1.5 text-sm wrap-break-word">
          {segments.map((segment, index) =>
            segment.isMatch ? (
              <mark
                key={index}
                className="bg-primary/20 text-foreground rounded-xs"
              >
                {segment.text}
              </mark>
            ) : (
              <span key={index}>{segment.text}</span>
            ),
          )}
        </p>
      </button>
    </li>
  );
};
