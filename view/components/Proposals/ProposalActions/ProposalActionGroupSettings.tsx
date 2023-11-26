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
import ProgressBar from '../../Shared/ProgressBar';
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

  const [getGroupSettings, { data, loading }] =
    useGroupSettingsByGroupIdLazyQuery();

  useEffect(() => {
    if (showDetails && groupId) {
      getGroupSettings({ variables: { groupId } });
    }
  }, [groupId, getGroupSettings, showDetails]);

  const groupSettingsToChange =
    'proposalAction' in groupSettings
      ? groupSettings.proposalAction.proposal.group?.settings
      : data?.group.settings;

  const oldPrivacy =
    ratified && 'oldPrivacy' in groupSettings
      ? groupSettings.oldPrivacy
      : groupSettingsToChange?.privacy;

  const isChangingPrivacy =
    groupSettings.privacy && groupSettings.privacy !== oldPrivacy;

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
        `${getPrivacyLabel(oldPrivacy)} → ${getPrivacyLabel(
          groupSettings.privacy,
        )}`,
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
            {t('proposals.labels.proposedGroupSettings')}:
          </Typography>

          <Typography
            display="inline-block"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            width={isDesktop ? undefined : '120px'}
          >
            {getSettingsChanges()}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ marginBottom: isDesktop ? 2.5 : 3 }}>
          {loading && <ProgressBar />}

          {data && (
            <Grid
              columns={isDesktop ? 12 : 4}
              columnSpacing={3}
              rowSpacing={1}
              container
            >
              {isChangingPrivacy && (
                <Grid item xs={6}>
                  <Typography
                    fontFamily="Inter Bold"
                    fontSize={15}
                    gutterBottom
                  >
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
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ProposalActionGroupSettings;
