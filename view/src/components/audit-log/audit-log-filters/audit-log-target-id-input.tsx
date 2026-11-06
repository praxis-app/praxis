import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuSearch } from 'react-icons/lu';

const TARGET_ID_DEBOUNCE_MS = 300;

interface Props {
  value?: string;
  onChange: (value?: string) => void;
}

export const AuditLogTargetIdInput = ({ value, onChange }: Props) => {
  const [draft, setDraft] = useState(value ?? '');
  const [prevValue, setPrevValue] = useState(value);
  const { t } = useTranslation();

  if (value !== prevValue) {
    setPrevValue(value);
    if (value === undefined) {
      setDraft('');
    }
  }

  useEffect(() => {
    const nextValue = draft.trim() || undefined;
    if (nextValue === value) {
      return;
    }
    const timer = window.setTimeout(
      () => onChange(nextValue),
      TARGET_ID_DEBOUNCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [draft, value, onChange]);

  return (
    <div className="relative">
      <LuSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        aria-label={t('auditLog.filters.targetId')}
        placeholder={t('auditLog.filters.targetId')}
        className="pl-9"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
      />
    </div>
  );
};
