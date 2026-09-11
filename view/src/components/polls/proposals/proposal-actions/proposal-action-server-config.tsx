import { type PollActionRes } from '@/types/poll-action.types';
import { useTranslation } from 'react-i18next';
import { ServerConfigChanges } from '../server-config-changes';
import { SERVER_CONFIG_FIELDS } from '../server-config-changes.utils';
import { ProposalActionAccordion } from './proposal-action-accordion';

export const ProposalActionServerConfig = ({
  action,
}: {
  action: PollActionRes;
}) => {
  const { t } = useTranslation();

  if (!action.serverConfig) {
    return null;
  }

  const changeCount = SERVER_CONFIG_FIELDS.filter((field) => {
    const previousKey =
      `prev${field[0].toUpperCase()}${field.slice(1)}` as keyof typeof action.serverConfig;
    return (
      action.serverConfig?.[field] != null &&
      action.serverConfig?.[previousKey] != null
    );
  }).length;

  return (
    <ProposalActionAccordion
      value="settings-change-proposal"
      summary={
        <>
          {t('proposals.labels.settingsChangeProposal')}:{' '}
          <span className="font-normal">
            {t('proposals.labels.settingChangesCount', { count: changeCount })}
          </span>
        </>
      }
    >
      <ServerConfigChanges changes={action.serverConfig} />
    </ProposalActionAccordion>
  );
};
