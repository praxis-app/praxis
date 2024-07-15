import { Schedule } from '@mui/icons-material';
import { Divider, SxProps, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { DecisionMakingModel } from '../../constants/proposal.constants';
import { ProposalCardFragment } from '../../graphql/proposals/fragments/gen/ProposalCard.gen';
import { formatClosingTime } from '../../utils/proposal.utils';
import Setting from '../Settings/Setting';
import Flex from '../Shared/Flex';
import Modal from '../Shared/Modal';

interface Props {
  settings: ProposalCardFragment['settings'];
  setShowSettingsModal(show: boolean): void;
  showSettingsModal: boolean;
}

const ProposalSettingsModal = ({
  settings: {
    closingAt,
    decisionMakingModel,
    ratificationThreshold,
    reservationsLimit,
    standAsidesLimit,
  },
  showSettingsModal,
  setShowSettingsModal,
}: Props) => {
  const { t } = useTranslation();

  const isClosed = closingAt && dayjs() > dayjs(closingAt);
  const showRatificationThreshold = decisionMakingModel !== 'CONSENT';

  const closingTimeLabel = t(
    isClosed ? 'proposals.labels.closedAt' : 'proposals.labels.closing',
    { time: formatClosingTime(closingAt) },
  );

  const modalContentStyles: SxProps = {
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'fit-content',
    paddingY: 3,
    gap: 2.5,
  };

  const getDecisionMakingModelName = (decisionMakingModel: string) => {
    if (decisionMakingModel === DecisionMakingModel.Consent) {
      return t('groups.labels.consent');
    }
    if (decisionMakingModel === DecisionMakingModel.MajorityVote) {
      return t('groups.labels.majorityVote');
    }
    return t('groups.labels.consensus');
  };

  return (
    <Modal
      title={t('proposals.labels.proposalSettings')}
      contentStyles={modalContentStyles}
      onClose={() => setShowSettingsModal(false)}
      open={showSettingsModal}
      centeredTitle
    >
      {closingAt && (
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

      <Setting
        name={t('groups.settings.names.decisionMakingModel')}
        description={t('groups.settings.explanations.decisionMakingModel')}
        value={getDecisionMakingModelName(decisionMakingModel)}
      />

      <Setting
        name={t('groups.settings.names.standAsidesLimit')}
        description={t('groups.settings.explanations.standAsidesLimit')}
        value={standAsidesLimit}
      />

      <Setting
        name={t('groups.settings.names.reservationsLimit')}
        description={t('groups.settings.explanations.reservationsLimit')}
        value={reservationsLimit}
        divider={showRatificationThreshold}
      />

      {showRatificationThreshold && (
        <>
          <Setting
            name={t('groups.settings.names.ratificationThreshold')}
            description={t(
              'groups.settings.explanations.ratificationThreshold',
            )}
            value={`${ratificationThreshold}%`}
            divider={false}
          />
        </>
      )}
    </Modal>
  );
};

export default ProposalSettingsModal;
