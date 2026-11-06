import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

const ALL_FILTER_VALUE = 'all';

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  value?: string;
  options: Option[];
  onChange: (value?: string) => void;
}

export const AuditLogFilterSelect = ({
  label,
  value,
  options,
  onChange,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Select
      value={value ?? ALL_FILTER_VALUE}
      onValueChange={(nextValue) =>
        onChange(nextValue === ALL_FILTER_VALUE ? undefined : nextValue)
      }
    >
      <SelectTrigger aria-label={label} className="w-full min-w-0">
        <span className="flex min-w-0 items-center gap-2">
          <span className="text-muted-foreground shrink-0">{label}</span>
          <SelectValue className="truncate" />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_FILTER_VALUE}>
          {t('auditLog.filters.all')}
        </SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
