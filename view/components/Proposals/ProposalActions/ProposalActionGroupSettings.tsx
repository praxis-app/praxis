import { Box, Divider, Grid, SxProps, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import {
  GroupAdminModel,
  GroupPrivacy,
} from '../../../constants/group.constants';
import { VotingTimeLimit } from '../../../constants/proposal.constants';
import {
  DecisionMakingModel,
  ProposalActionGroupConfigInput,
} from '../../../graphql/gen';
import { useGroupSettingsByGroupIdLazyQuery } from '../../../graphql/groups/queries/gen/GroupSettingsByGroupId.gen';
import { ProposalActionGroupSettingsFragment } from '../../../graphql/proposals/fragments/gen/ProposalActionGroupSettings.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../Shared/Accordion';
import ChangeDelta from './ChangeDelta';

interface Props {
  groupSettings:
    | ProposalActionGroupSettingsFragment
    | ProposalActionGroupConfigInput;
  groupId?: number | null;
  isCompact?: boolean;
  isShared?: boolean;
  preview?: boolean;
  proposalId?: number;
  ratified?: boolean;
}

const ProposalActionGroupSettings = ({
  groupId,
  groupSettings,
  isCompact,
  isShared,
  preview,
  proposalId,
  ratified,
}: Props) => {
  const { pathname } = useLocation();
  const isProposalPage = pathname.includes(`/proposals/${proposalId}`);
  const isPostPage = pathname.includes('/posts/');
  const [showDetails, setShowDetails] = useState(
    !!(preview || isProposalPage || isPostPage) && !isCompact,
  );

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const [getGroupSettings, { data }] = useGroupSettingsByGroupIdLazyQuery();

  useEffect(() => {
    if (preview && groupId) {
      getGroupSettings({ variables: { groupId } });
    }
  }, [groupId, getGroupSettings, preview]);

  const groupSettingsToChange =
    'proposalAction' in groupSettings
      ? groupSettings.proposalAction.proposal.group?.settings
      : data?.group.settings;

  const oldPrivacy =
    ratified && 'oldPrivacy' in groupSettings
      ? groupSettings.oldPrivacy
      : groupSettingsToChange?.privacy;

  const oldStandAsidesLimit =
    ratified && 'oldStandAsidesLimit' in groupSettings
      ? groupSettings.oldStandAsidesLimit
      : groupSettingsToChange?.standAsidesLimit;

  const oldReservationsLimit =
    ratified && 'oldReservationsLimit' in groupSettings
      ? groupSettings.oldReservationsLimit
      : groupSettingsToChange?.reservationsLimit;

  const oldRatificationThreshold =
    ratified && 'oldRatificationThreshold' in groupSettings
      ? groupSettings.oldRatificationThreshold
      : groupSettingsToChange?.ratificationThreshold;

  const oldVotingTimeLimit =
    ratified && 'oldVotingTimeLimit' in groupSettings
      ? groupSettings.oldVotingTimeLimit
      : groupSettingsToChange?.votingTimeLimit;

  const oldDecisionMakingModel =
    ratified && 'oldDecisionMakingModel' in groupSettings
      ? groupSettings.oldDecisionMakingModel
      : groupSettingsToChange?.decisionMakingModel;

  const oldAdminModel =
    ratified && 'oldAdminModel' in groupSettings
      ? groupSettings.oldAdminModel
      : groupSettingsToChange?.adminModel;

  const isChangingPrivacy =
    groupSettings.privacy && groupSettings.privacy !== oldPrivacy;

  const isChangingDecisionMakingModel =
    groupSettings.decisionMakingModel &&
    groupSettings.decisionMakingModel !== oldDecisionMakingModel;

  const isChangingAdminModel =
    groupSettings.adminModel && groupSettings.adminModel !== oldAdminModel;

  const isChangingNumberValue = (
    proposedValue: number | null | undefined,
    oldValue: number | null | undefined,
  ) => !!(proposedValue || proposedValue === 0) && proposedValue !== oldValue;

  const isChangingStandAsidesLimit = isChangingNumberValue(
    groupSettings.standAsidesLimit,
    oldStandAsidesLimit,
  );

  const isChangingReservationsLimit = isChangingNumberValue(
    groupSettings.reservationsLimit,
    oldReservationsLimit,
  );

  const isChangingRatificationThreshold = isChangingNumberValue(
    groupSettings.ratificationThreshold,
    oldRatificationThreshold,
  );

  const isChangingVotingTimeLimit = isChangingNumberValue(
    groupSettings.votingTimeLimit,
    oldVotingTimeLimit,
  );

  const accordionStyles: SxProps = {
    backgroundColor: isShared ? undefined : 'rgb(0, 0, 0, 0.1)',
    borderRadius: 2,
    paddingX: 2,
  };

  const getPrivacyLabel = (privacy?: string | null) => {
    if (privacy === GroupPrivacy.Public) {
      return t('groups.labels.public');
    }
    return t('groups.labels.private');
  };

  const getDecisionMakingModelLabel = (model?: string | null) => {
    if (model === DecisionMakingModel.Consent) {
      return t('groups.labels.consent');
    }
    if (model === DecisionMakingModel.MajorityVote) {
      return t('groups.labels.majorityVote');
    }
    return t('groups.labels.consensus');
  };

  const getAdminModel = (adminModel?: string | null) => {
    if (adminModel === GroupAdminModel.NoAdmin) {
      return t('groups.labels.noAdmin');
    }
    if (adminModel === GroupAdminModel.Rotating) {
      return t('groups.labels.rotatingAdmin');
    }
    return t('groups.labels.standard');
  };

  const getVotingTimeLimitLabel = (votingTimeLimit?: number | null) => {
    if (votingTimeLimit === VotingTimeLimit.HalfHour) {
      return t('time.minutesFull', { count: 30 });
    }
    if (votingTimeLimit === VotingTimeLimit.OneHour) {
      return t('time.hoursFull', { count: 1 });
    }
    if (votingTimeLimit === VotingTimeLimit.HalfDay) {
      return t('time.hoursFull', { count: 12 });
    }
    if (votingTimeLimit === VotingTimeLimit.OneDay) {
      return t('time.daysFull', { count: 1 });
    }
    if (votingTimeLimit === VotingTimeLimit.ThreeDays) {
      return t('time.daysFull', { count: 3 });
    }
    if (votingTimeLimit === VotingTimeLimit.OneWeek) {
      return t('time.weeks', { count: 1 });
    }
    return t('time.weeks', { count: 2 });
  };

  const getSettingsChanges = () => {
    let settingsChanged = 0;

    if (isChangingPrivacy) {
      settingsChanged += 1;
    }
    if (isChangingStandAsidesLimit) {
      settingsChanged += 1;
    }
    if (isChangingReservationsLimit) {
      settingsChanged += 1;
    }
    if (isChangingRatificationThreshold) {
      settingsChanged += 1;
    }
    if (isChangingVotingTimeLimit) {
      settingsChanged += 1;
    }
    if (isChangingDecisionMakingModel) {
      settingsChanged += 1;
    }
    if (isChangingAdminModel) {
      settingsChanged += 1;
    }

    return t('proposals.labels.settingChangesCount', {
      count: settingsChanged,
    });
  };

  return (
    <Box
      marginBottom={preview || isShared ? 0 : 2.5}
      marginTop={preview ? 2 : 0}
    >
      <Accordion
        expanded={showDetails}
        onChange={() => setShowDetails(!showDetails)}
        sx={accordionStyles}
      >
        <AccordionSummary>
          <Typography
            fontFamily="Inter Bold"
            marginRight="0.5ch"
            whiteSpace="nowrap"
          >
            {isDesktop
              ? t('proposals.labels.proposedGroupSettings')
              : t('proposals.labels.proposedSettings')}
            :
          </Typography>

          <Typography
            display="inline-block"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            width={isDesktop && !isShared ? '330px' : '140px'}
          >
            {getSettingsChanges()}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ marginBottom: isDesktop ? 2.5 : 3 }}>
          <Grid
            columns={isDesktop ? 12 : 4}
            columnSpacing={3}
            rowSpacing={1}
            container
          >
            {isChangingAdminModel && (
              <ChangeDelta
                label={t('groups.settings.names.adminModel')}
                proposedValue={getAdminModel(groupSettings.adminModel)}
                oldValue={getAdminModel(oldAdminModel)}
              />
            )}

            {isChangingDecisionMakingModel && (
              <ChangeDelta
                label={t('groups.settings.names.decisionMakingModel')}
                proposedValue={getDecisionMakingModelLabel(
                  groupSettings.decisionMakingModel,
                )}
                oldValue={getDecisionMakingModelLabel(oldDecisionMakingModel)}
              />
            )}

            {isChangingRatificationThreshold && (
              <ChangeDelta
                label={t('groups.settings.names.ratificationThreshold')}
                proposedValue={`${groupSettings.ratificationThreshold}%`}
                oldValue={`${oldRatificationThreshold}%`}
              />
            )}

            {isChangingStandAsidesLimit && (
              <ChangeDelta
                label={t('groups.settings.names.standAsidesLimit')}
                proposedValue={groupSettings.standAsidesLimit}
                oldValue={oldStandAsidesLimit}
              />
            )}

            {isChangingReservationsLimit && (
              <ChangeDelta
                label={t('groups.settings.names.reservationsLimit')}
                proposedValue={groupSettings.reservationsLimit}
                oldValue={oldReservationsLimit}
              />
            )}

            {isChangingVotingTimeLimit && (
              <ChangeDelta
                label={t('groups.settings.names.votingTimeLimit')}
                proposedValue={getVotingTimeLimitLabel(
                  groupSettings.votingTimeLimit,
                )}
                oldValue={getVotingTimeLimitLabel(oldVotingTimeLimit)}
              />
            )}

            {isChangingPrivacy && (
              <ChangeDelta
                label={t('groups.settings.names.privacy')}
                proposedValue={getPrivacyLabel(groupSettings.privacy)}
                oldValue={getPrivacyLabel(oldPrivacy)}
              />
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {isShared && (
        <Divider sx={{ marginX: 2, marginBottom: showDetails ? 1.5 : 1 }} />
      )}
    </Box>
  );
};

export default ProposalActionGroupSettings;
