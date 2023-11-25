import { Box, SxProps, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../Shared/Accordion';

interface Props {
  groupSettings: any;
  preview?: boolean;
}

const ProposalActionGroupSettings = ({ preview }: Props) => {
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
          TODO: Add group settings here
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ProposalActionGroupSettings;
