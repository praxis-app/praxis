import { Flag, Language, Person, Place, Timer } from '@mui/icons-material';
import { Box, Divider, SxProps, Typography } from '@mui/material';
import dayjs from 'dayjs';
import humanizeDuration from 'humanize-duration';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ProposalActionEventInput } from '../../../apollo/gen';
import { ProposalActionEventFragment } from '../../../apollo/proposals/generated/ProposalActionEvent.fragment';
import { useUserByUserIdLazyQuery } from '../../../apollo/users/generated/UserByUserId.query';
import { useAboveBreakpoint, useIsDesktop } from '../../../hooks/shared.hooks';
import { getGroupEventsTabPath } from '../../../utils/group.utils';
import { formatDateTime } from '../../../utils/time.utils';
import { getUserProfilePath } from '../../../utils/user.utils';
import EventAvatar from '../../Events/EventAvatar';
import CoverPhoto from '../../Images/CoverPhoto';
import Accordion, {
  AccordionDetails,
  AccordionSummary,
} from '../../Shared/Accordion';
import ExternalLink from '../../Shared/ExternalLink';
import Link from '../../Shared/Link';

interface Props {
  event: ProposalActionEventFragment | ProposalActionEventInput;
  coverPhotoFile?: File;
  preview?: boolean;
}

const ProposalActionEvent = ({ event, coverPhotoFile, preview }: Props) => {
  const { pathname } = useLocation();
  const isProposalPage = pathname.includes('/proposals/');
  const [showEvent, setShowEvent] = useState(!!preview || isProposalPage);

  const [getUserByUserId, { data }] = useUserByUserIdLazyQuery();

  // Fetch user data required for preview
  useEffect(() => {
    if (!preview || 'id' in event) {
      return;
    }
    getUserByUserId({
      variables: { id: event.hostId },
    });
  }, [preview, event, getUserByUserId]);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const isAboveSmall = useAboveBreakpoint('sm');

  const {
    name,
    description,
    externalLink,
    location,
    online,
    endsAt,
    startsAt,
    coverPhoto,
  } = event;

  const group =
    'proposalAction' in event ? event.proposalAction.proposal.group : undefined;
  const host = 'id' in event ? event.host : data?.user;

  const groupEventsTabPath = getGroupEventsTabPath(group?.name || '');
  const hostPath = getUserProfilePath(host?.name || '');

  const startsAtFormatted = formatDateTime(startsAt);
  const endsAtFormatted = dayjs(endsAt).format(' [-] h:mm a');
  const startsAtWithEndsAt = `${startsAtFormatted}${endsAtFormatted}`;
  const isSameDay = endsAt && dayjs(startsAt).isSame(endsAt, 'day');

  const difference = dayjs(endsAt).diff(startsAt);
  const duration = humanizeDuration(difference)
    .replace(/,/g, '')
    .replace(/hours|hour/g, t('time.hr'))
    .replace(/minutes|minute/g, t('time.min'));

  const accordionStyles: SxProps = {
    backgroundColor: 'rgb(0, 0, 0, 0.1)',
    borderRadius: 2,
    paddingX: 2,
  };
  const iconStyles: SxProps = {
    fontSize: 20,
    marginBottom: '-0.3ch',
    marginRight: '0.8ch',
  };
  const eventAvatarStyles: SxProps = {
    marginTop: 0.6,
    marginRight: 0.7,
    marginLeft: 0.2,
  };

  const getNameTextWidth = () => {
    if (isDesktop) {
      return '75%';
    }
    if (isAboveSmall) {
      return '70%';
    }
    return '100%';
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
            {t('proposals.labels.eventProposal')}:
          </Typography>
          {'id' in event && (
            <EventAvatar event={event} size={15} sx={eventAvatarStyles} />
          )}
          <Typography
            display="inline-block"
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            width={isDesktop ? undefined : '120px'}
          >
            {name}
          </Typography>
        </AccordionSummary>

        <AccordionDetails sx={{ marginBottom: isDesktop ? 2.5 : 3 }}>
          {(coverPhoto || coverPhotoFile) && (
            <CoverPhoto
              imageId={coverPhoto?.id}
              imageFile={coverPhotoFile}
              sx={{ marginBottom: 2.1, height: 125 }}
              rounded
            />
          )}

          <Typography
            color="#dd3f4f"
            fontSize="14px"
            fontFamily="Inter Bold"
            textTransform="uppercase"
            marginBottom={0.9}
          >
            {isSameDay ? startsAtWithEndsAt : startsAtFormatted}
          </Typography>

          <Typography
            color="primary"
            variant="h5"
            width={getNameTextWidth()}
            marginBottom={1.3}
          >
            {name}
          </Typography>

          {group && (
            <Typography color="text.secondary" gutterBottom>
              <Flag sx={iconStyles} />
              {t('events.labels.eventBy')}
              <Link href={groupEventsTabPath} sx={{ marginLeft: '0.4ch' }}>
                {group.name}
              </Link>
            </Typography>
          )}

          {host && (
            <Typography color="text.secondary" gutterBottom>
              <Person sx={iconStyles} />
              {t('events.labels.host')}:
              <Link href={hostPath} sx={{ marginLeft: '0.4ch' }}>
                {host.name}
              </Link>
            </Typography>
          )}

          {location && (
            <Typography color="text.secondary" gutterBottom>
              <Place sx={iconStyles} />
              {location}
            </Typography>
          )}

          {endsAt && (
            <Typography color="text.secondary" gutterBottom>
              <Timer sx={iconStyles} />
              {t('events.labels.duration', { duration })}
            </Typography>
          )}

          {online && (
            <Typography color="text.secondary">
              <Language sx={iconStyles} />
              {externalLink
                ? t('events.labels.onlineWithColon') + ' '
                : t('events.labels.onlineEvent')}
              {externalLink && (
                <ExternalLink href={externalLink}>{externalLink}</ExternalLink>
              )}
            </Typography>
          )}

          <Divider sx={{ marginY: 2 }} />

          <Typography variant="h6" gutterBottom>
            {t('events.headers.whatToExpect')}
          </Typography>

          <Typography>{description}</Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default ProposalActionEvent;
