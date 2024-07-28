import { Box, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavigationPaths } from '../../../constants/shared.constants';
import { ProposalActionFragment } from '../../../graphql/proposals/fragments/gen/ProposalAction.gen';
import AttachedImage from '../../Images/AttachedImage';
import Link from '../../Shared/Link';
import ProposalActionEvent from './ProposalActionEvent';
import ProposalActionGroupSettings from './ProposalActionGroupSettings';
import ProposalActionRole from './ProposalActionRole';

interface Props {
  action: ProposalActionFragment;
  isCompact?: boolean;
  isServerScope?: boolean;
  isShared?: boolean;
  proposalId: number;
  ratified: boolean;
}

const ProposalAction = ({
  action: {
    actionType,
    event,
    groupCoverPhoto,
    groupDescription,
    groupName,
    groupSettings,
    role,
  },
  isCompact,
  isServerScope,
  isShared,
  proposalId,
  ratified,
}: Props) => {
  const { t } = useTranslation();

  const proposalPath = `${NavigationPaths.Proposals}/${proposalId}`;

  if (actionType === 'ChangeSettings') {
    if (!groupSettings) {
      return (
        <Typography marginBottom={3.5}>
          {t('errors.somethingWentWrong')}
        </Typography>
      );
    }
    return (
      <ProposalActionGroupSettings
        groupSettings={groupSettings}
        ratified={ratified}
        isShared={isShared}
        isCompact={isCompact}
        proposalId={proposalId}
      />
    );
  }

  if (actionType === 'PlanEvent') {
    if (!event) {
      return (
        <Typography marginBottom={3.5}>
          {t('errors.somethingWentWrong')}
        </Typography>
      );
    }
    return (
      <ProposalActionEvent
        event={event}
        isShared={isShared}
        isCompact={isCompact}
        proposalId={proposalId}
      />
    );
  }

  if (actionType === 'CreateRole' || actionType === 'ChangeRole') {
    if (!role) {
      return (
        <Typography marginBottom={3.5}>
          {t('errors.somethingWentWrong')}
        </Typography>
      );
    }
    return (
      <ProposalActionRole
        role={role}
        actionType={actionType}
        isCompact={isCompact}
        isServerScope={isServerScope}
        isShared={isShared}
        proposalId={proposalId}
        ratified={ratified}
      />
    );
  }

  if (actionType === 'ChangeName') {
    return (
      <Box
        marginBottom={isShared ? 0 : 3.5}
        marginTop={isShared ? 1.5 : 0}
        paddingLeft={isShared ? 2 : 0}
        paddingRight={isShared ? 2 : 0}
      >
        <Link href={proposalPath}>
          <Box component="span" fontFamily="Inter Medium" marginRight="0.5ch">
            {t('proposals.labels.newGroupName')}:
          </Box>
          {groupName}
        </Link>

        {isShared && <Divider sx={{ marginTop: 1.5, marginBottom: 1 }} />}
      </Box>
    );
  }

  if (actionType === 'ChangeDescription') {
    return (
      <Box
        marginBottom={isShared ? 0 : 3.5}
        marginTop={isShared ? 1.5 : 0}
        paddingLeft={isShared ? 2 : 0}
        paddingRight={isShared ? 2 : 0}
      >
        <Link href={proposalPath}>
          <Box component="span" fontFamily="Inter Medium" marginRight="0.5ch">
            {t('proposals.labels.newGroupDescription')}:
          </Box>
          {groupDescription}
        </Link>

        {isShared && <Divider sx={{ marginTop: 1.5, marginBottom: 1 }} />}
      </Box>
    );
  }

  if (actionType === 'ChangeCoverPhoto') {
    if (!groupCoverPhoto) {
      return (
        <Link
          href={proposalPath}
          sx={{
            display: 'block',
            marginBottom: 3.5,
            marginTop: isShared ? 0.8 : 0,
            paddingLeft: isShared ? 1.5 : 0,
          }}
        >
          {t('errors.somethingWentWrong')}
        </Link>
      );
    }
    return (
      <Box
        marginBottom={isShared ? 0 : '20px'}
        marginTop={isShared ? 1 : 0}
        paddingLeft={isShared ? 2 : 0}
        paddingRight={isShared ? 2 : 0}
      >
        <Link href={proposalPath}>
          <Typography fontSize={14} fontFamily="Inter Medium" gutterBottom>
            {t('proposals.labels.proposedGroupCoverPhoto')}:
          </Typography>
          <AttachedImage image={groupCoverPhoto} width="55%" />
        </Link>

        {isShared && <Divider sx={{ marginY: 0.8 }} />}
      </Box>
    );
  }

  return null;
};

export default ProposalAction;
