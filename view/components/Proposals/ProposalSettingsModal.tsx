import { useTranslation } from 'react-i18next';
import { ProposalCardFragment } from '../../graphql/proposals/fragments/gen/ProposalCard.gen';
import Modal from '../Shared/Modal';
import ProposalSetting from './ProposalSetting';

interface Props {
  settings: ProposalCardFragment['settings'];
  setShowSettingsModal(show: boolean): void;
  showSettingsModal: boolean;
}

const ProposalSettingsModal = ({
  showSettingsModal,
  setShowSettingsModal,
  settings,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Modal
      title={t('proposals.labels.proposalSettings')}
      contentStyles={{
        paddingTop: 5,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
      onClose={() => setShowSettingsModal(false)}
      open={showSettingsModal}
      centeredTitle
    >
      <ProposalSetting
        name={t('groups.settings.names.decisionMakingModel')}
        description={t('groups.settings.descriptions.decisionMakingModel')}
        value={settings.decisionMakingModel}
      />

      <ProposalSetting
        name={t('groups.settings.names.standAsidesLimit')}
        description={t('groups.settings.descriptions.standAsidesLimit')}
        value={settings.standAsidesLimit}
      />

      <ProposalSetting
        name={t('groups.settings.names.reservationsLimit')}
        description={t('groups.settings.descriptions.reservationsLimit')}
        value={settings.reservationsLimit}
      />

      <ProposalSetting
        name={t('groups.settings.names.ratificationThreshold')}
        description={t('groups.settings.descriptions.ratificationThreshold')}
        value={settings.ratificationThreshold}
        divider={false}
      />
    </Modal>
  );
};

export default ProposalSettingsModal;
