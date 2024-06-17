import { useReactiveVar } from '@apollo/client';
import {
  Card,
  CardContent as MuiCardContent,
  styled,
  Typography,
} from '@mui/material';
import { truncate } from 'lodash';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import EventPageCard from '../../components/Events/EventPageCard';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import FormattedText from '../../components/Shared/FormattedText';
import ProgressBar from '../../components/Shared/ProgressBar';
import { TruncationSizes } from '../../constants/shared.constants';
import { isVerifiedVar } from '../../graphql/cache';
import { useEventPageLazyQuery } from '../../graphql/events/queries/gen/EventPage.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { isDeniedAccess } from '../../utils/error.utils';
import { getGroupEventsTabPath } from '../../utils/group.utils';
import EventDiscussionTab from './EventDiscussionTab';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 20,
  },
}));

const EventPage = () => {
  const [tab, setTab] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const isVerified = useReactiveVar(isVerifiedVar);

  const [getEvent, { data, loading, error }] = useEventPageLazyQuery({
    errorPolicy: 'all',
  });

  const { id } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const event = data?.event;
  const description = event?.description;
  const canManageAllEvents = !!data?.me?.serverPermissions.manageEvents;

  useEffect(() => {
    if (id && !isDeleting) {
      getEvent({
        variables: { id: parseInt(id), isVerified },
      });
    }
  }, [id, getEvent, isDeleting, isVerified]);

  if (loading) {
    return <ProgressBar />;
  }

  if (!event || !id) {
    if (isDeniedAccess(error)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }

    if (error) {
      return <Typography>{t('errors.somethingWentWrong')}</Typography>;
    }
    return null;
  }

  const breadcrumbs = event.group
    ? [
        {
          label: truncate(event.group.name, {
            length: isDesktop ? TruncationSizes.Medium : TruncationSizes.Small,
          }),
          href: getGroupEventsTabPath(event.group.name),
        },
        {
          label: event.name,
        },
      ]
    : [];

  return (
    <>
      {event.group && <Breadcrumbs breadcrumbs={breadcrumbs} />}

      <EventPageCard
        event={event}
        canManageAllEvents={canManageAllEvents}
        setIsDeleting={setIsDeleting}
        setTab={setTab}
        tab={tab}
      />

      {tab === 0 && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {t('events.headers.whatToExpect')}
            </Typography>

            <FormattedText text={description} />
          </CardContent>
        </Card>
      )}

      {tab === 1 && <EventDiscussionTab eventId={parseInt(id)} />}
    </>
  );
};

export default EventPage;
