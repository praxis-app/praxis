import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import { LuSearch } from 'react-icons/lu';

interface Props {
  value?: string;
  onChange: (value?: string) => void;
}

export const AuditLogTargetIdInput = ({ value, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <LuSearch className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2" />
      <Input
        aria-label={t('auditLog.filters.targetId')}
        placeholder={t('auditLog.filters.targetId')}
        className="pl-9"
        value={value ?? ''}
        onChange={(event) => onChange(event.target.value || undefined)}
      />
    </div>
  );
};
