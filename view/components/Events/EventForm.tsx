import { Add } from '@mui/icons-material';
import {
  Button,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  SxProps,
  Typography,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Form, Formik, FormikErrors } from 'formik';
import { produce } from 'immer';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toastVar } from '../../apollo/cache';
import { useCreateEventMutation } from '../../apollo/events/generated/CreateEvent.mutation';
import { EventFormFragment } from '../../apollo/events/generated/EventForm.fragment';
import { useUpdateEventMutation } from '../../apollo/events/generated/UpdateEvent.mutation';
import { CreateEventInput, UpdateEventInput } from '../../apollo/gen';
import {
  GroupEventsTabDocument,
  GroupEventsTabQuery,
} from '../../apollo/groups/generated/GroupEventsTab.query';
import { useGroupMembersByGroupIdLazyQuery } from '../../apollo/groups/generated/GroupMembersByGroupId.query';
import { Blurple } from '../../styles/theme';
import { getEventPath } from '../../utils/event.utils';
import { getRandomString, isValidUrl } from '../../utils/shared.utils';
import { startOfNextHour } from '../../utils/time.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import DateTimePicker from '../Shared/DateTimePicker';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import ProgressBar from '../Shared/ProgressBar';
import { TextField } from '../Shared/TextField';

export enum EventFormFieldName {
  Name = 'name',
  Description = 'description',
  Location = 'location',
  ExternalLink = 'externalLink',
  StartsAt = 'startsAt',
  EndsAt = 'endsAt',
  Online = 'online',
  HostId = 'hostId',
}

export const SHOW_ENDS_AT_BUTTON_STYLES: SxProps = {
  color: Blurple.SkyDancer,
  padding: 0,
  textTransform: 'none',
  width: 'fit-content',
  '&.MuiButtonBase-root:hover': {
    bgcolor: 'transparent',
    textDecoration: 'underline',
  },
  marginBottom: 0.8,
};

interface Props {
  editEvent?: EventFormFragment;
  groupId?: number;
}

const EventForm = ({ editEvent, groupId }: Props) => {
  const [imageInputKey, setImageInputKey] = useState('');
  const [coverPhoto, setCoverPhoto] = useState<File>();
  const [showEndsAt, setShowEndsAt] = useState(!!editEvent?.endsAt);

  const [getGroupMembers, { data, loading }] =
    useGroupMembersByGroupIdLazyQuery();

  const [createEvent] = useCreateEventMutation();
  const [updateEvent] = useUpdateEventMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!groupId) {
      return;
    }
    getGroupMembers({
      variables: {
        groupId,
      },
    });
  }, [groupId, getGroupMembers]);

  const initialValues = {
    name: editEvent ? editEvent.name : '',
    description: editEvent ? editEvent.description : '',
    startsAt: editEvent ? dayjs(editEvent.startsAt) : startOfNextHour(),
    endsAt: editEvent ? dayjs(editEvent.endsAt) : null,
    location: editEvent ? editEvent.location : '',
    online: editEvent ? editEvent.online : null,
    externalLink: editEvent ? editEvent.externalLink : '',
    hostId: editEvent ? editEvent.host.id : 0,
  };

  const handleCreate = async (formValues: CreateEventInput) =>
    await createEvent({
      variables: {
        eventData: {
          ...formValues,
          coverPhoto,
          groupId,
        },
      },
      async update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          createEvent: { event },
        } = data;
        if (groupId) {
          cache.updateQuery<GroupEventsTabQuery>(
            {
              query: GroupEventsTabDocument,
              variables: { groupId, isLoggedIn: true },
            },
            (eventsData) =>
              produce(eventsData, (draft) => {
                draft?.group.futureEvents.unshift(event);
              }),
          );
        }
        cache.evict({ fieldName: 'events' });
      },
      onCompleted({ createEvent: { event } }) {
        const groupPagePath = getEventPath(event.id);
        navigate(groupPagePath);
      },
      onError() {
        throw new Error(t('events.errors.couldNotCreate'));
      },
    });

  const handleUpdate = async (
    formValues: Omit<UpdateEventInput, 'id'>,
    editEvent: EventFormFragment,
  ) =>
    await updateEvent({
      variables: {
        eventData: {
          id: editEvent.id,
          ...formValues,
          coverPhoto,
        },
      },
      onCompleted() {
        const groupPagePath = getEventPath(editEvent.id);
        navigate(groupPagePath);
      },
      onError() {
        throw new Error(t('events.errors.couldNotUpdate'));
      },
    });

  const handleSubmit = async (formValues: CreateEventInput) => {
    try {
      if (editEvent) {
        await handleUpdate(formValues, editEvent);
        return;
      }
      await handleCreate(formValues);
    } catch (err) {
      toastVar({
        status: 'error',
        title: String(err),
      });
    }
  };

  const handleRemoveSelectedImage = () => {
    setCoverPhoto(undefined);
    setImageInputKey(getRandomString());
  };

  const handleStartsAtChange =
    (setFieldValue: (field: string, value: Dayjs | null) => void) =>
    (value: Dayjs | null) => {
      setFieldValue(EventFormFieldName.StartsAt, value);

      if (showEndsAt) {
        setFieldValue(
          EventFormFieldName.EndsAt,
          dayjs(value).add(1, 'hour').startOf('hour'),
        );
      }
    };

  const handleShowEndsAtButtonClick =
    (
      values: CreateEventInput,
      setFieldValue: (field: string, value: Dayjs | null) => void,
    ) =>
    () => {
      if (!showEndsAt) {
        setFieldValue(
          EventFormFieldName.EndsAt,
          dayjs(values.startsAt).add(1, 'hour').startOf('hour'),
        );
      } else {
        setFieldValue(EventFormFieldName.EndsAt, null);
      }
      setShowEndsAt(!showEndsAt);
    };

  const validate = ({
    description,
    externalLink,
    hostId,
    location,
    name,
    online,
  }: CreateEventInput) => {
    const errors: FormikErrors<CreateEventInput> = {};
    if (!name) {
      errors.name = t('events.errors.missingName');
    }
    if (!description) {
      errors.description = t('events.errors.missingDetails');
    }
    if (online === null) {
      errors.online = t('events.errors.onlineOrOffline');
    }
    if (online === false && !location) {
      errors.location = t('events.errors.missingLocation');
    }
    if (externalLink && !isValidUrl(externalLink)) {
      errors.externalLink = t('events.errors.invalidLink');
    }
    if (!hostId) {
      errors.hostId = t('events.errors.missingHost');
    }
    return errors;
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={validate}
    >
      {({
        dirty,
        errors,
        handleChange,
        isSubmitting,
        setFieldValue,
        submitCount,
        values,
      }) => (
        <Form>
          <FormGroup sx={{ marginBottom: 2 }}>
            <TextField
              autoComplete="off"
              label={t('events.form.name')}
              name={EventFormFieldName.Name}
            />
            <TextField
              autoComplete="off"
              label={t('events.form.description')}
              name={EventFormFieldName.Description}
              multiline
            />

            <DateTimePicker
              label={t('events.form.startDateAndTime')}
              onChange={handleStartsAtChange(setFieldValue)}
              value={values.startsAt}
            />
            {showEndsAt && (
              <DateTimePicker
                label={t('events.form.endDateAndTime')}
                onChange={(value: Dayjs | null) =>
                  setFieldValue(EventFormFieldName.EndsAt, value)
                }
                value={values.endsAt}
              />
            )}
            <Button
              onClick={handleShowEndsAtButtonClick(values, setFieldValue)}
              sx={SHOW_ENDS_AT_BUTTON_STYLES}
              startIcon={<Add />}
            >
              {t('events.form.endDateAndTime')}
            </Button>

            {loading && <ProgressBar />}

            {data && (
              <FormControl
                error={!!errors.hostId && !!submitCount}
                sx={{ marginBottom: 1 }}
                variant="standard"
              >
                <InputLabel>{t('events.labels.selectHost')}</InputLabel>
                <Select
                  name={EventFormFieldName.HostId}
                  onChange={handleChange}
                  value={values.hostId || ''}
                >
                  {data.group.members.map(({ id, name }) => (
                    <MenuItem value={id} key={id}>
                      {name}
                    </MenuItem>
                  ))}
                </Select>
                {!!(errors.hostId && submitCount) && (
                  <Typography color="error" fontSize="small" marginTop={0.5}>
                    {errors.hostId}
                  </Typography>
                )}
              </FormControl>
            )}

            <FormControl
              error={!!errors.online && !!submitCount}
              sx={{ marginBottom: 1 }}
              variant="standard"
            >
              <InputLabel>{t('events.form.inPersonOrVirtual')}</InputLabel>
              <Select
                value={values.online === null ? '' : Number(!!values.online)}
                name={EventFormFieldName.Online}
                onChange={(e) =>
                  setFieldValue(EventFormFieldName.Online, !!e.target.value)
                }
              >
                <MenuItem value={0}>{t('events.form.inPerson')}</MenuItem>
                <MenuItem value={1}>{t('events.form.virtual')}</MenuItem>
              </Select>
              {!!(errors.online && submitCount) && (
                <Typography color="error" fontSize="small" marginTop={0.5}>
                  {errors.online}
                </Typography>
              )}
            </FormControl>

            {values.online !== null && !values.online && (
              <TextField
                autoComplete="off"
                label={t('events.form.location')}
                name={EventFormFieldName.Location}
                placeholder={t('events.form.includeLocation')}
              />
            )}

            {!!values.online && (
              <TextField
                autoComplete="off"
                label={t('events.form.externalLink')}
                name={EventFormFieldName.ExternalLink}
              />
            )}

            {coverPhoto && (
              <AttachedImagePreview
                handleRemove={handleRemoveSelectedImage}
                selectedImages={[coverPhoto]}
              />
            )}
          </FormGroup>

          <Flex sx={{ justifyContent: 'space-between' }}>
            <ImageInput refreshKey={imageInputKey} setImage={setCoverPhoto} />
            <PrimaryActionButton
              disabled={isSubmitting || (!dirty && !coverPhoto)}
              isLoading={isSubmitting}
              sx={{ marginTop: 1.5 }}
              type="submit"
            >
              {editEvent ? t('actions.save') : t('actions.create')}
            </PrimaryActionButton>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default EventForm;
