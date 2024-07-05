import { Box, Divider, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProposalActionType } from '../../../constants/proposal.constants';
import { NavigationPaths } from '../../../constants/shared.constants';
import { ProposalActionFragment } from '../../../graphql/proposals/fragments/gen/ProposalAction.gen';
import AttachedImage from '../../Images/AttachedImage';
import Link from '../../Shared/Link';
import ProposalActionEvent from './ProposalActionEvent';
import ProposalActionGroupSettings from './ProposalActionGroupSettings';
import ProposalActionRole from './ProposalActionRole';

interface Props {
  action: ProposalActionFragment;
  proposalId: number;
  isShared?: boolean;
  isCompact?: boolean;
  ratified: boolean;
}

const ProposalAction = ({
  action: {
    actionType,
    event,
    groupSettings,
    groupCoverPhoto,
    groupDescription,
    groupName,
    role,
  },
  ratified,
  proposalId,
  isCompact,
  isShared,
}: Props) => {
  const { t } = useTranslation();

  const proposalPath = `${NavigationPaths.Proposals}/${proposalId}`;

  if (actionType === ProposalActionType.ChangeSettings) {
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

  if (actionType === ProposalActionType.PlanEvent) {
    if (!event) {
      return (
        <Typography marginBottom={3.5}>
          {t('errors.somethingWentWrong')}
        </Typography>
      );
    }
    return <ProposalActionEvent event={event} isShared={isShared} />;
  }

  if (
    actionType === ProposalActionType.CreateRole ||
    actionType === ProposalActionType.ChangeRole
  ) {
    if (!role) {
      return (
        <Typography marginBottom={3.5}>
          {t('errors.somethingWentWrong')}
        </Typography>
      );
    }
    return (
      <ProposalActionRole
        actionType={actionType}
        isShared={isShared}
        ratified={ratified}
        role={role}
      />
    );
  }

  if (actionType === ProposalActionType.ChangeName) {
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

  if (actionType === ProposalActionType.ChangeDescription) {
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

  if (actionType === ProposalActionType.ChangeCoverPhoto) {
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
