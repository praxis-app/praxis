import { useReactiveVar } from '@apollo/client';
import { Box, Divider, Stack, SxProps, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, toastVar } from '../../apollo/cache';
import { useDeleteEventMutation } from '../../apollo/events/generated/DeleteEvent.mutation';
import { EventCompactFragment } from '../../apollo/events/generated/EventCompact.fragment';
import { MIDDOT_WITH_SPACES } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getEventPath } from '../../utils/event.utils';
import { getImagePath } from '../../utils/image.utils';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import EventAttendeeButtons from './EventAttendeeButtons';

interface Props {
  event: EventCompactFragment;
  isLast: boolean;
}

const EventCompact = ({ event, isLast }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [deleteEvent] = useDeleteEventMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const {
    id,
    coverPhoto,
    startsAt,
    name,
    group,
    interestedCount,
    goingCount,
    online,
    location,
  } = event;
  const canManageEvents = group?.myPermissions?.manageEvents;

  const imageSrc = getImagePath(coverPhoto.id);
  const imageSize = isDesktop ? '90px' : '65px';

  const eventPagePath = getEventPath(id);
  const editEventPath = `${eventPagePath}/edit`;
  const startDate = dayjs(startsAt).format('ddd, MMM D, YYYY');

  const showInterestedCount =
    !!interestedCount &&
    (goingCount === 0 ||
      interestedCount === goingCount ||
      interestedCount > goingCount ||
      isDesktop);

  const showGoingCount =
    !!goingCount &&
    (goingCount > interestedCount || interestedCount === 0 || isDesktop);

  const deletePrompt = t('prompts.deleteItem', {
    itemType: 'event',
  });
  const dividerStyles: SxProps = {
    marginBottom: !isLoggedIn && !isDesktop ? 2.7 : 2,
    marginTop: 2,
  };

  const handleDelete = async () =>
    await deleteEvent({
      variables: { id },
      update(cache) {
        const cacheId = cache.identify(event);
        cache.evict({ id: cacheId });
        cache.gc();
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });

  const renderButtonStack = () => {
    if (!isLoggedIn) {
      return null;
    }
    return (
      <Stack direction="row" spacing={1} height={40}>
        <EventAttendeeButtons event={event} withGoingButton={false} />
        <ItemMenu
          anchorEl={menuAnchorEl}
          buttonStyles={{ maxWidth: 40, minWidth: 40 }}
          canDelete={canManageEvents}
          canUpdate={canManageEvents}
          deleteItem={handleDelete}
          deletePrompt={deletePrompt}
          editPath={editEventPath}
          setAnchorEl={setMenuAnchorEl}
          variant="ghost"
        />
      </Stack>
    );
  };

  return (
    <>
      <Flex justifyContent="space-between">
        <Flex width="100%">
          <Link href={eventPagePath}>
            <Box
              alt={t('images.labels.coverPhoto')}
              borderRadius="8px"
              component="img"
              width={imageSize}
              height={imageSize}
              marginRight={1.5}
              src={imageSrc}
              sx={{ objectFit: 'cover' }}
            />
          </Link>

          <Box marginTop={-0.5} width="100%">
            <Link href={eventPagePath}>
              <Typography
                fontFamily="Inter Bold"
                fontSize={13}
                lineHeight={1}
                variant="overline"
              >
                {startDate}
              </Typography>
              <Typography
                fontFamily="Inter Bold"
                fontSize={20}
                lineHeight={1.2}
              >
                {name}
              </Typography>
            </Link>

            <Stack
              direction="row"
              divider={<>{MIDDOT_WITH_SPACES}</>}
              spacing={2}
              color="text.secondary"
              fontSize="15px"
              marginBottom={isDesktop ? 0 : 0.7}
            >
              {showInterestedCount && (
                <>
                  {interestedCount} {t('events.labels.interested')}
                </>
              )}
              {showGoingCount && (
                <>
                  {goingCount} {t('events.labels.going')}
                </>
              )}
              {!!online && !isDesktop && <>{t('events.labels.onlineEvent')}</>}
              {!!location && !isDesktop && <>{location}</>}
            </Stack>

            {isDesktop && (
              <Stack
                direction="row"
                divider={<>{MIDDOT_WITH_SPACES}</>}
                spacing={2}
                color="text.secondary"
                fontSize="15px"
              >
                {!!online && <>{t('events.labels.onlineEvent')}</>}
                {!!location && <>{location}</>}
              </Stack>
            )}

            {!isDesktop && renderButtonStack()}
          </Box>
        </Flex>

        {isDesktop && renderButtonStack()}
      </Flex>

      {!isLast && <Divider sx={dividerStyles} />}
    </>
  );
};

export default EventCompact;
