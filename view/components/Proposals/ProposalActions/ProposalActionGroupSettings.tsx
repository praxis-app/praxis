import { Box, Grid, SxProps, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { GroupPrivacy } from '../../../constants/group.constants';
import { ChangeType } from '../../../constants/shared.constants';
import { ProposalActionGroupConfigInput } from '../../../graphql/gen';
import { useGroupSettingsByGroupIdLazyQuery } from '../../../graphql/groups/queries/gen/GroupSettingsByGroupId.gen';
import { ProposalActionGroupSettingsFragment } from '../../../graphql/proposals/fragments/gen/ProposalActionGroupSettings.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../Shared/Accordion';
import Flex from '../../Shared/Flex';
import ChangeIcon from './ChangeIcon';

interface Props {
  groupSettings:
    | ProposalActionGroupSettingsFragment
    | ProposalActionGroupConfigInput;
  groupId?: number | null;
  preview?: boolean;
  ratified?: boolean;
}

const ProposalActionGroupSettings = ({
  groupSettings,
  preview,
  ratified,
  groupId,
}: Props) => {
  const { pathname } = useLocation();
  const isProposalPage = pathname.includes('/proposals/');
  const [showDetails, setShowDetails] = useState(!!preview || isProposalPage);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const theme = useTheme();

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

  const isChangingPrivacy =
    groupSettings.privacy && groupSettings.privacy !== oldPrivacy;

  const isChangingStandAsidesLimit =
    groupSettings.standAsidesLimit &&
    groupSettings.standAsidesLimit !== oldStandAsidesLimit;

  const isChangingReservationsLimit =
    groupSettings.reservationsLimit &&
    groupSettings.reservationsLimit !== oldReservationsLimit;

  const isChangingRatificationThreshold =
    groupSettings.ratificationThreshold &&
    groupSettings.ratificationThreshold !== oldRatificationThreshold;

  const accordionStyles: SxProps = {
    backgroundColor: 'rgb(0, 0, 0, 0.1)',
    borderRadius: 2,
    paddingX: 2,
  };
  const changeStyles: SxProps = {
    borderColor: theme.palette.divider,
    borderRadius: 1,
    borderStyle: 'solid',
    borderWidth: 1,
    fontSize: 14,
    marginBottom: 1,
    paddingX: 0.6,
    paddingY: 0.5,
  };

  const getPrivacyLabel = (privacy?: string | null) => {
    if (privacy === GroupPrivacy.Public) {
      return t('groups.labels.public');
    }
    return t('groups.labels.private');
  };

  const getSettingsChanges = () => {
    const changes: string[] = [];

    if (isChangingPrivacy) {
      changes.push(
        `${t('groups.settings.names.privacy')} - ${getPrivacyLabel(
          oldPrivacy,
        )} → ${getPrivacyLabel(groupSettings.privacy)}`,
      );
    }
    if (isChangingStandAsidesLimit) {
      changes.push(
        `${t(
          'groups.settings.names.standAsidesLimit',
        )} - ${oldStandAsidesLimit} → ${groupSettings.standAsidesLimit}`,
      );
    }
    if (isChangingReservationsLimit) {
      changes.push(
        `${t(
          'groups.settings.names.reservationsLimit',
        )} - ${oldReservationsLimit} → ${groupSettings.reservationsLimit}`,
      );
    }
    if (isChangingRatificationThreshold) {
      changes.push(
        `${t(
          'groups.settings.names.ratificationThreshold',
        )} - ${oldRatificationThreshold}% → ${
          groupSettings.ratificationThreshold
        }%`,
      );
    }
    return changes.join(', ');
  };

  return (
    <Box marginBottom={preview ? 0 : 2.5} marginTop={preview ? 2 : 0}>
      <Accordion
        expanded={showDetails}
        onChange={() => setShowDetails(!showDetails)}
        sx={accordionStyles}
      >
        <AccordionSummary>
          <Typography marginRight="0.5ch" fontFamily="Inter Bold">
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
            width={isDesktop ? '330px' : '130px'}
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
            {isChangingRatificationThreshold && (
              <Grid item xs={6}>
                <Typography fontFamily="Inter Bold" fontSize={15} gutterBottom>
                  {t('groups.settings.names.ratificationThreshold')}
                </Typography>

                <Flex sx={changeStyles}>
                  <ChangeIcon
                    changeType={ChangeType.Remove}
                    sx={{ marginRight: '0.8ch' }}
                  />
                  <Typography
                    color="primary"
                    fontSize="inherit"
                    marginRight="0.25ch"
                  >
                    {oldRatificationThreshold}%
                  </Typography>
                </Flex>

                <Flex sx={changeStyles}>
                  <ChangeIcon
                    changeType={ChangeType.Add}
                    sx={{ marginRight: '0.8ch' }}
                  />
                  <Typography
                    color="primary"
                    fontSize="inherit"
                    marginRight="0.25ch"
                  >
                    {groupSettings.ratificationThreshold}%
                  </Typography>
                </Flex>
              </Grid>
            )}

            {isChangingStandAsidesLimit && (
              <Grid item xs={6}>
                <Typography fontFamily="Inter Bold" fontSize={15} gutterBottom>
                  {t('groups.settings.names.standAsidesLimit')}
                </Typography>

                <Flex sx={changeStyles}>
                  <ChangeIcon
                    changeType={ChangeType.Remove}
                    sx={{ marginRight: '0.8ch' }}
                  />
                  <Typography
                    color="primary"
                    fontSize="inherit"
                    marginRight="0.25ch"
                  >
                    {oldStandAsidesLimit}
                  </Typography>
                </Flex>

                <Flex sx={changeStyles}>
                  <ChangeIcon
                    changeType={ChangeType.Add}
                    sx={{ marginRight: '0.8ch' }}
                  />
                  <Typography
                    color="primary"
                    fontSize="inherit"
                    marginRight="0.25ch"
                  >
                    {groupSettings.standAsidesLimit}
                  </Typography>
                </Flex>
              </Grid>
            )}

            {isChangingReservationsLimit && (
              <Grid item xs={6}>
                <Typography fontFamily="Inter Bold" fontSize={15} gutterBottom>
                  {t('groups.settings.names.reservationsLimit')}
                </Typography>

                <Flex sx={changeStyles}>
                  <ChangeIcon
                    changeType={ChangeType.Remove}
                    sx={{ marginRight: '0.8ch' }}
                  />
                  <Typography
                    color="primary"
                    fontSize="inherit"
                    marginRight="0.25ch"
                  >
                    {oldReservationsLimit}
                  </Typography>
                </Flex>

                <Flex sx={changeStyles}>
                  <ChangeIcon
                    changeType={ChangeType.Add}
                    sx={{ marginRight: '0.8ch' }}
                  />
                  <Typography
                    color="primary"
                    fontSize="inherit"
                    marginRight="0.25ch"
                  >
                    {groupSettings.reservationsLimit}
                  </Typography>
                </Flex>
              </Grid>
            )}

            {isChangingPrivacy && (
              <Grid item xs={6}>
                <Typography fontFamily="Inter Bold" fontSize={15} gutterBottom>
                  {t('groups.settings.names.privacy')}
                </Typography>

                <Flex sx={changeStyles}>
                  <ChangeIcon
                    changeType={ChangeType.Remove}
                    sx={{ marginRight: '0.8ch' }}
                  />
                  <Typography
                    color="primary"
                    fontSize="inherit"
                    marginRight="0.25ch"
                  >
                    {getPrivacyLabel(oldPrivacy)}
                  </Typography>
                </Flex>

                <Flex sx={changeStyles}>
                  <ChangeIcon
                    changeType={ChangeType.Add}
                    sx={{ marginRight: '0.8ch' }}
                  />
                  <Typography
                    color="primary"
                    fontSize="inherit"
                    marginRight="0.25ch"
                  >
                    {getPrivacyLabel(groupSettings.privacy)}
                  </Typography>
                </Flex>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ProposalActionGroupSettings;
