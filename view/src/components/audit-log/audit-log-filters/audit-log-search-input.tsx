import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/shared.utils';
import { useTranslation } from 'react-i18next';
import { LuSearch, LuX } from 'react-icons/lu';

const MAX_SEARCH_LENGTH = 100;

interface Props {
  value?: string;
  onChange: (value?: string) => void;
}

export const AuditLogSearchInput = ({ value, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <LuSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        type="search"
        aria-label={t('auditLog.filters.search')}
        placeholder={t('auditLog.filters.searchPlaceholder')}
        className={cn(
          'pl-9 [&::-webkit-search-cancel-button]:hidden',
          value && 'pr-9',
        )}
        maxLength={MAX_SEARCH_LENGTH}
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={t('auditLog.filters.clearSearch')}
          className="text-muted-foreground absolute top-1/2 right-1 size-7 -translate-y-1/2"
          onClick={() => onChange(undefined)}
        >
          <LuX />
        </Button>
      )}
    </div>
  );
};
