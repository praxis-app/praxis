import { Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useEditEventLazyQuery } from '../../apollo/events/generated/EditEvent.query';
import EventForm from '../../components/Events/EventForm';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import Card from '../../components/Shared/Card';
import ProgressBar from '../../components/Shared/ProgressBar';
import { TruncationSizes } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getEventPath } from '../../utils/event.utils';
import { getGroupEventsTabPath } from '../../utils/group.utils';

const EditEvent = () => {
  const [getEvent, { data, loading, error }] = useEditEventLazyQuery({
    errorPolicy: 'all',
  });

  const { id } = useParams();
  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const event = data?.event;
  const group = event?.group;

  useEffect(() => {
    if (id) {
      getEvent({
        variables: { id: parseInt(id) },
      });
    }
  }, [id, getEvent]);

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!event) {
    return null;
  }

  if (!group?.myPermissions.manageEvents) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

  const breadcrumbs = [
    {
      label: truncate(group.name, {
        length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
      }),
      href: getGroupEventsTabPath(group.name),
    },
    {
      label: truncate(event.name, {
        length: isDesktop ? TruncationSizes.Small : TruncationSizes.ExtraSmall,
      }),
      href: getEventPath(event.id),
    },
    {
      label: t('events.actions.editEvent'),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

      <Card>
        <EventForm editEvent={event} />
      </Card>
    </>
  );
};

export default EditEvent;
