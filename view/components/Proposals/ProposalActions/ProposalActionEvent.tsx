import { Flag, Language, Person, Place, Timer } from '@mui/icons-material';
import { Box, Divider, SxProps, Typography } from '@mui/material';
import dayjs from 'dayjs';
import humanizeDuration from 'humanize-duration';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ProposalActionEventInput } from '../../../graphql/gen';
import { ProposalActionEventFragment } from '../../../graphql/proposals/fragments/gen/ProposalActionEvent.gen';
import { useUserByUserIdLazyQuery } from '../../../graphql/users/queries/gen/UserByUserId.gen';
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
import FormattedText from '../../Shared/FormattedText';
import Link from '../../Shared/Link';

interface Props {
  event: ProposalActionEventFragment | ProposalActionEventInput;
  coverPhotoFile?: File;
  isCompact?: boolean;
  isShared?: boolean;
  preview?: boolean;
  proposalId?: number;
}

const ProposalActionEvent = ({
  event,
  coverPhotoFile,
  isCompact,
  isShared,
  preview,
  proposalId,
}: Props) => {
  const { pathname } = useLocation();
  const isPostPage = pathname.includes('/posts/');
  const isProposalPage = pathname.includes(`/proposals/${proposalId}`);
  const [showEvent, setShowEvent] = useState(
    !!(preview || isProposalPage || isPostPage) && !isCompact,
  );

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
    backgroundColor: isShared ? undefined : 'rgb(0, 0, 0, 0.1)',
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

  const getSummaryTextWidth = () => {
    if (isDesktop) {
      if (isCompact) {
        return '310px';
      }
      return '380px';
    }
    if (isCompact) {
      return '100px';
    }
    return '120px';
  };

  return (
    <Box
      marginBottom={preview || isShared ? 0 : 2.5}
      marginTop={preview ? 2 : 0}
    >
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
            width={getSummaryTextWidth()}
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

          <FormattedText text={description} />
        </AccordionDetails>
      </Accordion>

      {isShared && (
        <Divider sx={{ marginX: 2, marginBottom: showEvent ? 1.5 : 1 }} />
      )}
    </Box>
  );
};

export default ProposalActionEvent;
