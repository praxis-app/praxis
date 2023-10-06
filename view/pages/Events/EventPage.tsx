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
import { isLoggedInVar } from '../../apollo/cache';
import { useEventPageLazyQuery } from '../../apollo/events/generated/EventPage.query';
import EventPageCard from '../../components/Events/EventPageCard';
import PostForm from '../../components/Posts/PostForm';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import Feed from '../../components/Shared/Feed';
import ProgressBar from '../../components/Shared/ProgressBar';
import { TruncationSizes } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { isDeniedAccess } from '../../utils/error.utils';
import { getGroupEventsTabPath } from '../../utils/group.utils';

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 20,
  },
}));

const EventPage = () => {
  const [tab, setTab] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [getEvent, { data, loading, error }] = useEventPageLazyQuery({
    errorPolicy: 'all',
  });

  const { id } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (id && !isDeleting) {
      getEvent({
        variables: { id: parseInt(id), isLoggedIn },
      });
    }
  }, [id, getEvent, isDeleting, isLoggedIn]);

  if (loading) {
    return <ProgressBar />;
  }

  if (!data || !id) {
    if (isDeniedAccess(error)) {
      return <Typography>{t('prompts.permissionDenied')}</Typography>;
    }

    if (error) {
      return <Typography>{t('errors.somethingWentWrong')}</Typography>;
    }
    return null;
  }

  const { event, me } = data;
  const canManageAllEvents = !!me?.serverPermissions.manageEvents;

  const breadcrumbs = event.group
    ? [
        {
          label: truncate(event.group.name, {
            length: isDesktop
              ? TruncationSizes.Small
              : TruncationSizes.ExtraSmall,
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

            <Typography>{event.description}</Typography>
          </CardContent>
        </Card>
      )}

      {tab === 1 && (
        <>
          {isLoggedIn && (
            <Card>
              <CardContent
                sx={{
                  '&:last-child': {
                    paddingBottom: 1,
                  },
                }}
              >
                <PostForm eventId={parseInt(id)} />
              </CardContent>
            </Card>
          )}

          <Feed feed={event.posts} />
        </>
      )}
    </>
  );
};

export default EventPage;
