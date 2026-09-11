import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SEARCH_MAX_QUERY_LENGTH } from '@/constants/search.constants';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MdClose, MdSearch } from 'react-icons/md';

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export const SearchInput = ({ value, onChange }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  return (
    <div className="relative">
      <MdSearch
        aria-hidden="true"
        className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2"
      />
      <Input
        ref={inputRef}
        type="search"
        autoFocus
        autoComplete="off"
        spellCheck={false}
        maxLength={SEARCH_MAX_QUERY_LENGTH}
        aria-label={t('search.labels.queryInput')}
        placeholder={t('search.placeholders.query')}
        className="pr-10 pl-10 [&::-webkit-search-cancel-button]:hidden"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('search.actions.clear')}
          className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
          onClick={() => {
            onChange('');
            inputRef.current?.focus();
          }}
        >
          <MdClose className="size-4" />
        </Button>
      )}
    </div>
  );
};
