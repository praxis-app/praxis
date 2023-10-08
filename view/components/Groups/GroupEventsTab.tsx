import { useReactiveVar } from '@apollo/client';
import { Event as CalendarIcon } from '@mui/icons-material';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar } from '../../apollo/cache';
import { useGroupEventsTabQuery } from '../../apollo/groups/generated/GroupEventsTab.query';
import { DarkMode } from '../../styles/theme';
import EventCompact from '../Events/EventCompact';
import EventForm from '../Events/EventForm';
import Center from '../Shared/Center';
import GhostButton from '../Shared/GhostButton';
import Modal from '../Shared/Modal';
import ProgressBar from '../Shared/ProgressBar';

interface Props {
  groupId: number;
}

const GroupEventsTab = ({ groupId }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, loading, error } = useGroupEventsTabQuery({
    variables: { groupId, isLoggedIn },
  });

  const { t } = useTranslation();

  const handleCloseModal = () => setIsModalOpen(false);

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  const {
    group: { futureEvents, pastEvents, myPermissions },
  } = data;

  const showCreateEventButton =
    myPermissions?.createEvents || myPermissions?.manageEvents;

  return (
    <>
      <Modal
        title={t('events.actions.createEvent')}
        onClose={handleCloseModal}
        open={isModalOpen}
        centeredTitle
      >
        <EventForm groupId={groupId} />
      </Modal>

      <Card>
        <CardHeader
          title={
            <Typography variant="h6">
              {t('events.headers.upcomingEvents')}
            </Typography>
          }
          action={
            showCreateEventButton && (
              <GhostButton
                onClick={() => setIsModalOpen(true)}
                sx={{ marginRight: 0.5, marginTop: 0.5 }}
              >
                {t('events.actions.createEvent')}
              </GhostButton>
            )
          }
        />
        <CardContent>
          {!futureEvents.length && (
            <>
              <Center marginBottom={1} marginTop={2}>
                <CalendarIcon sx={{ fontSize: 80, color: DarkMode.Liver }} />
              </Center>
              <Typography textAlign="center" marginBottom={4}>
                {t('events.prompts.noUpcomingEvents')}
              </Typography>
            </>
          )}

          {futureEvents.map((event, index) => (
            <EventCompact
              key={event.id}
              event={event}
              isLast={index + 1 === futureEvents.length}
            />
          ))}
        </CardContent>
      </Card>

      {!!pastEvents.length && (
        <Card>
          <CardHeader
            title={
              <Typography variant="h6">
                {t('events.headers.pastEvents')}
              </Typography>
            }
          />
          <CardContent>
            {pastEvents.map((event, index) => (
              <EventCompact
                key={event.id}
                event={event}
                isLast={index + 1 === pastEvents.length}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default GroupEventsTab;
