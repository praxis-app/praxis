import { ApolloCache } from '@apollo/client';
import { CheckCircle, Star } from '@mui/icons-material';
import { ButtonProps, Stack, StackProps, styled } from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../graphql/cache';
import { EventAttendeeButtonsFragment } from '../../graphql/events/fragments/gen/EventAttendeeButtons.gen';
import { useCreateEventAttendeeMutation } from '../../graphql/events/mutations/gen/CreateEventAttendee.gen';
import { useDeleteEventAttendeeMutation } from '../../graphql/events/mutations/gen/DeleteEventAttendee.gen';
import { useUpdateEventAttendeeMutation } from '../../graphql/events/mutations/gen/UpdateEventAttendee.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { Blurple } from '../../styles/theme';
import GhostButton from '../Shared/GhostButton';

enum EventAttendeeStatus {
  CoHost = 'co-host',
  Going = 'going',
  Host = 'host',
  Interested = 'interested',
}

const PrimaryButton = styled(GhostButton)(() => ({
  color: Blurple.PoolWater,
  borderColor: Blurple.PoolWater,
  '&:hover': {
    borderColor: Blurple.PoolWater,
    backgroundColor: Blurple.BlueWhale,
  },
}));

interface Props extends StackProps {
  event: EventAttendeeButtonsFragment;
  withGoingButton?: boolean;
  itemMenu?: ReactNode;
}

const EventAttendeeButtons = ({
  event,
  withGoingButton = true,
  itemMenu,
  ...stackProps
}: Props) => {
  const [createEventAttendee, { loading: createAttendeeLoading }] =
    useCreateEventAttendeeMutation();
  const [updateEventAttendee, { loading: updateAttendeeLoading }] =
    useUpdateEventAttendeeMutation();
  const [deleteEventAttendee, { loading: deleteAttendeeLoading }] =
    useDeleteEventAttendeeMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const isGoing = event.attendingStatus === EventAttendeeStatus.Going;
  const isHosting = event.attendingStatus === EventAttendeeStatus.Host;
  const isInterested = event.attendingStatus === EventAttendeeStatus.Interested;

  const isLoading =
    createAttendeeLoading || updateAttendeeLoading || deleteAttendeeLoading;

  const GoingButton = isGoing ? PrimaryButton : GhostButton;
  const InterestedButton = isInterested ? PrimaryButton : GhostButton;

  const removeAttendee =
    (status: 'going' | 'interested') => (cache: ApolloCache<any>) => {
      cache.modify({
        id: cache.identify(event),
        fields: {
          attendingStatus: () => null,
          goingCount: (c: number) => (status === 'going' ? c - 1 : c),
          interestedCount: (c: number) => (status === 'interested' ? c - 1 : c),
        },
      });
    };

  const handleInterestedButtonClick = async () => {
    if (isHosting) {
      toastVar({
        title: t('events.prompts.alreadyHosting'),
        status: 'info',
      });
      return;
    }
    if (event.group && !event.group.isJoinedByMe) {
      toastVar({
        title: t('events.prompts.joinGroupToAttend'),
        status: 'info',
      });
      return;
    }
    if (isInterested) {
      await deleteEventAttendee({
        variables: { eventId: event.id },
        update: removeAttendee('interested'),
      });
      return;
    }
    const variables = {
      eventAttendeeData: {
        status: EventAttendeeStatus.Interested,
        eventId: event.id,
      },
    };
    if (isGoing) {
      await updateEventAttendee({ variables });
      return;
    }
    await createEventAttendee({ variables });
  };

  const handleGoingButtonClick = async () => {
    if (isHosting) {
      toastVar({
        title: t('events.prompts.alreadyHosting'),
        status: 'info',
      });
      return;
    }
    if (event.group && !event.group.isJoinedByMe) {
      toastVar({
        title: t('events.prompts.joinGroupToAttend'),
        status: 'info',
      });
      return;
    }
    if (isGoing) {
      await deleteEventAttendee({
        variables: { eventId: event.id },
        update: removeAttendee('going'),
      });
      return;
    }
    const variables = {
      eventAttendeeData: {
        status: EventAttendeeStatus.Going,
        eventId: event.id,
      },
    };
    if (isInterested) {
      await updateEventAttendee({ variables });
      return;
    }
    await createEventAttendee({ variables });
  };

  const interestedButtonProps: ButtonProps = {
    disabled: isLoading,
    onClick: handleInterestedButtonClick,
    startIcon: <Star />,
  };

  if (!withGoingButton) {
    return (
      <InterestedButton
        fullWidth={!withGoingButton && !isDesktop}
        {...interestedButtonProps}
      >
        {t('events.labels.interested')}
      </InterestedButton>
    );
  }

  return (
    <Stack
      direction="row"
      marginBottom={2}
      marginTop={1.5}
      spacing={1}
      {...stackProps}
    >
      <InterestedButton {...interestedButtonProps}>
        {t('events.labels.interested')}
      </InterestedButton>

      <GoingButton
        disabled={isLoading}
        onClick={handleGoingButtonClick}
        startIcon={<CheckCircle />}
      >
        {t('events.labels.going')}
      </GoingButton>

      {itemMenu}
    </Stack>
  );
};

export default EventAttendeeButtons;
