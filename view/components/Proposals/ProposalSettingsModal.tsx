import { Schedule } from '@mui/icons-material';
import { Divider, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DecisionMakingModel } from '../../constants/proposal.constants';
import { ProposalCardFragment } from '../../graphql/proposals/fragments/gen/ProposalCard.gen';
import { formatClosingTime } from '../../utils/proposal.utils';
import Flex from '../Shared/Flex';
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

  const isClosed =
    settings.votingEndsAt && dayjs() > dayjs(settings.votingEndsAt);

  const closingTimeLabel = t(
    isClosed ? 'proposals.labels.closedAt' : 'proposals.labels.closing',
    { time: formatClosingTime(settings.votingEndsAt) },
  );

  const getDecisionMakingModelName = (decisionMakingModel: string) => {
    if (decisionMakingModel === DecisionMakingModel.Consent) {
      return t('groups.labels.consent');
    }
    return t('groups.labels.consensus');
  };

  return (
    <Modal
      title={t('proposals.labels.proposalSettings')}
      contentStyles={{
        paddingTop: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
      onClose={() => setShowSettingsModal(false)}
      open={showSettingsModal}
      centeredTitle
    >
      {settings.votingEndsAt && (
        <>
          <Flex
            alignItems="center"
            color="#dd3f4f"
            fontFamily="Inter Bold"
            fontSize={['14px', '16px']}
            gap="6px"
          >
            <Schedule sx={{ fontSize: ['20px', undefined] }} />
            <Typography fontSize="14px" fontFamily="Inter Bold">
              {closingTimeLabel}
            </Typography>
          </Flex>

          <Divider />
        </>
      )}

      <ProposalSetting
        name={t('groups.settings.names.decisionMakingModel')}
        description={t('proposals.settings.descriptions.decisionMakingModel')}
        value={getDecisionMakingModelName(settings.decisionMakingModel)}
      />

      <ProposalSetting
        name={t('groups.settings.names.standAsidesLimit')}
        description={t('proposals.settings.descriptions.standAsidesLimit')}
        value={settings.standAsidesLimit}
      />

      <ProposalSetting
        name={t('groups.settings.names.reservationsLimit')}
        description={t('proposals.settings.descriptions.reservationsLimit')}
        value={settings.reservationsLimit}
      />

      <ProposalSetting
        name={t('groups.settings.names.ratificationThreshold')}
        description={t('proposals.settings.descriptions.ratificationThreshold')}
        value={`${settings.ratificationThreshold}%`}
        divider={false}
      />
    </Modal>
  );
};

export default ProposalSettingsModal;
