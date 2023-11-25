import { Box, SxProps, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ProposalActionGroupConfigInput } from '../../../graphql/gen';
import { ProposalActionGroupSettingsFragment } from '../../../graphql/proposals/fragments/gen/ProposalActionGroupSettings.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../Shared/Accordion';

interface Props {
  groupSettings:
    | ProposalActionGroupSettingsFragment
    | ProposalActionGroupConfigInput;
  preview?: boolean;
}

const ProposalActionGroupSettings = ({ groupSettings, preview }: Props) => {
  const { pathname } = useLocation();
  const isProposalPage = pathname.includes('/proposals/');
  const [showEvent, setShowEvent] = useState(!!preview || isProposalPage);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const accordionStyles: SxProps = {
    backgroundColor: 'rgb(0, 0, 0, 0.1)',
    borderRadius: 2,
    paddingX: 2,
  };

  return (
    <Box marginBottom={preview ? 0 : 2.5} marginTop={preview ? 2 : 0}>
      <Accordion
        expanded={showEvent}
        onChange={() => setShowEvent(!showEvent)}
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
            Summary of settings changes
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ marginBottom: isDesktop ? 2.5 : 3 }}>
          {JSON.stringify(groupSettings)}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ProposalActionGroupSettings;
