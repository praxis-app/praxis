import { type PollActionServerConfigRes } from '@/types/poll-action.types';
import { useTranslation } from 'react-i18next';
import { ProposalActionChange } from './proposal-actions/proposal-action-change';
import {
  formatServerConfigValue,
  SERVER_CONFIG_FIELDS,
} from './server-config-changes.utils';

export const ServerConfigChanges = ({
  changes,
}: {
  changes: PollActionServerConfigRes;
}) => {
  const { t } = useTranslation();
  return (
    <div className="col-span-full grid gap-x-6 gap-y-4 sm:grid-cols-2">
      {SERVER_CONFIG_FIELDS.map((field) => {
        const value = changes[field];
        const previous =
          changes[
            `prev${field[0].toUpperCase()}${field.slice(1)}` as keyof PollActionServerConfigRes
          ];

        if (value == null || previous == null) {
          return null;
        }

        return (
          <ProposalActionChange
            key={field}
            label={t(`settings.names.${field}`)}
            oldValue={formatServerConfigValue(field, previous)}
            proposedValue={formatServerConfigValue(field, value)}
          />
        );
      })}
    </div>
  );
};
