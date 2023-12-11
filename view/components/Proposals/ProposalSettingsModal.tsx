import { useTranslation } from 'react-i18next';
import Modal from '../Shared/Modal';
import Flex from '../Shared/Flex';
import { Box, Typography } from '@mui/material';
import { ProposalCardFragment } from '../../graphql/proposals/fragments/gen/ProposalCard.gen';

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
      <Flex justifyContent="space-between">
        <Box>
          <Typography>
            {t('groups.settings.names.decisionMakingModel')}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            {t('groups.settings.descriptions.decisionMakingModel')}
          </Typography>
        </Box>

        <Typography>{settings.standAsidesLimit}</Typography>
      </Flex>

      <Flex justifyContent="space-between">
        <Box>
          <Typography>{t('groups.settings.names.standAsidesLimit')}</Typography>

          <Typography fontSize={12} color="text.secondary">
            {t('groups.settings.descriptions.standAsidesLimit')}
          </Typography>
        </Box>

        <Typography>{settings.standAsidesLimit}</Typography>
      </Flex>

      <Flex justifyContent="space-between">
        <Box>
          <Typography>
            {t('groups.settings.names.reservationsLimit')}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            {t('groups.settings.descriptions.reservationsLimit')}
          </Typography>
        </Box>

        <Typography>{settings.reservationsLimit}</Typography>
      </Flex>

      <Flex justifyContent="space-between">
        <Box>
          <Typography>
            {t('groups.settings.names.ratificationThreshold')}
          </Typography>

          <Typography fontSize={12} color="text.secondary">
            {t('groups.settings.descriptions.ratificationThreshold')}
          </Typography>
        </Box>

        <Typography>{settings.ratificationThreshold}</Typography>
      </Flex>
    </Modal>
  );
};

export default ProposalSettingsModal;
