import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { ProposalActionType } from '../../../constants/proposal.constants';
import { ProposalActionFragment } from '../../../graphql/proposals/fragments/gen/ProposalAction.gen';
import AttachedImage from '../../Images/AttachedImage';
import ProposalActionEvent from './ProposalActionEvent';
import ProposalActionGroupSettings from './ProposalActionGroupSettings';
import ProposalActionRole from './ProposalActionRole';

interface Props {
  action: ProposalActionFragment;
  isShared?: boolean;
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
  isShared,
}: Props) => {
  const { t } = useTranslation();

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
        ratified={ratified}
        role={role}
      />
    );
  }

  if (actionType === ProposalActionType.ChangeName) {
    return (
      <Typography marginBottom={3.5}>
        {t('proposals.labels.newGroupName')}: {groupName}
      </Typography>
    );
  }

  if (actionType === ProposalActionType.ChangeDescription) {
    return (
      <Typography marginBottom={3.5}>
        {t('proposals.labels.newGroupDescription')}: {groupDescription}
      </Typography>
    );
  }

  if (actionType === ProposalActionType.ChangeCoverPhoto) {
    if (!groupCoverPhoto) {
      return (
        <Typography marginBottom={3.5}>
          {t('errors.somethingWentWrong')}
        </Typography>
      );
    }
    return (
      <Box marginBottom="20px">
        <Typography gutterBottom fontSize={14}>
          {t('proposals.labels.proposedGroupCoverPhoto')}:
        </Typography>
        <AttachedImage image={groupCoverPhoto} width="55%" />
      </Box>
    );
  }

  return null;
};

export default ProposalAction;
