import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SEARCH_KINDS } from '@/constants/search.constants';
import { type ChannelRes } from '@/types/channel.types';
import { type SearchFilters as SearchFiltersValue } from '@/types/search.types';
import { useTranslation } from 'react-i18next';

const ALL_VALUE = 'all';

interface Props {
  channels: ChannelRes[];
  filters: SearchFiltersValue;
  onChange: (filters: SearchFiltersValue) => void;
}

export const SearchFilters = ({ channels, filters, onChange }: Props) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        value={filters.channelId ?? ALL_VALUE}
        onValueChange={(value) =>
          onChange({
            ...filters,
            channelId: value === ALL_VALUE ? undefined : value,
          })
        }
      >
        <SelectTrigger
          className="w-full min-w-0 sm:flex-1"
          aria-label={t('search.labels.channelFilter')}
        >
          <SelectValue placeholder={t('search.filters.allChannels')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>
            {t('search.filters.allChannels')}
          </SelectItem>
          {channels.map((channel) => (
            <SelectItem key={channel.id} value={channel.id}>
              {channel.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.kind ?? ALL_VALUE}
        onValueChange={(value) =>
          onChange({
            ...filters,
            kind:
              value === ALL_VALUE
                ? undefined
                : (value as SearchFiltersValue['kind']),
          })
        }
      >
        <SelectTrigger
          className="w-full min-w-0 sm:flex-1"
          aria-label={t('search.labels.kindFilter')}
        >
          <SelectValue placeholder={t('search.filters.allKinds')} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL_VALUE}>
            {t('search.filters.allKinds')}
          </SelectItem>
          {SEARCH_KINDS.map((kind) => (
            <SelectItem key={kind} value={kind}>
              {t(`search.kinds.${kind}`)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
