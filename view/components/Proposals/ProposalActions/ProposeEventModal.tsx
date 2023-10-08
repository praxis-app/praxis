import { Add } from '@mui/icons-material';
import {
  Button,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import { Form, Formik, FormikErrors } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ProposalActionEventInput } from '../../../apollo/gen';
import { useGroupMembersByGroupIdLazyQuery } from '../../../apollo/groups/generated/GroupMembersByGroupId.query';
import {
  ProposalActionFieldName,
  ProposalActionType,
} from '../../../constants/proposal.constants';
import { getRandomString, isValidUrl } from '../../../utils/shared.utils';
import { startOfNextHour } from '../../../utils/time.utils';
import {
  EventFormFieldName,
  SHOW_ENDS_AT_BUTTON_STYLES,
} from '../../Events/EventForm';
import AttachedImagePreview from '../../Images/AttachedImagePreview';
import ImageInput from '../../Images/ImageInput';
import DateTimePicker from '../../Shared/DateTimePicker';
import Flex from '../../Shared/Flex';
import Modal from '../../Shared/Modal';
import PrimaryActionButton from '../../Shared/PrimaryActionButton';
import ProgressBar from '../../Shared/ProgressBar';
import { TextField } from '../../Shared/TextField';

interface Props {
  actionType?: string;
  groupId?: number | null;
  currentUserId: number;
  setFieldValue: (
    field: ProposalActionFieldName,
    value: ProposalActionEventInput,
  ) => void;
  onClose(): void;
}

const ProposeEventModal = ({
  actionType,
  groupId,
  onClose,
  setFieldValue,
}: Props) => {
  const [coverPhoto, setCoverPhoto] = useState<File>();
  const [imageInputKey, setImageInputKey] = useState('');
  const [showEndsAt, setShowEndsAt] = useState(false);
  const [open, setOpen] = useState(false);

  const [getGroupMembers, { data, loading }] =
    useGroupMembersByGroupIdLazyQuery();

  const { t } = useTranslation();

  useEffect(() => {
    if (groupId) {
      getGroupMembers({ variables: { groupId } });
    }
  }, [groupId, getGroupMembers]);

  useEffect(() => {
    if (groupId && actionType === ProposalActionType.PlanEvent) {
      setOpen(true);
    }
  }, [groupId, actionType]);

  const initialValues: ProposalActionEventInput = {
    name: '',
    description: '',
    location: '',
    externalLink: '',
    online: null,
    hostId: 0,
    startsAt: startOfNextHour(),
    endsAt: null,
  };

  const handleClose = () => {
    setCoverPhoto(undefined);
    setOpen(false);
    onClose();
  };

  const handleSubmit = async (formValues: ProposalActionEventInput) => {
    setFieldValue(ProposalActionFieldName.Event, {
      ...formValues,
      coverPhoto,
    });
    setOpen(false);
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
      values: ProposalActionEventInput,
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

  const handleRemoveSelectedImage = () => {
    setCoverPhoto(undefined);
    setImageInputKey(getRandomString());
  };

  const validate = ({
    description,
    externalLink,
    hostId,
    location,
    name,
    online,
  }: ProposalActionEventInput) => {
    const errors: FormikErrors<ProposalActionEventInput> = {};
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
    <Modal
      open={open}
      onClose={handleClose}
      title={t('proposals.actionTypes.planEvent')}
      centeredTitle
    >
      <Formik
        initialValues={initialValues}
        onSubmit={handleSubmit}
        validate={validate}
      >
        {({
          errors,
          handleChange,
          isSubmitting,
          setFieldValue,
          submitCount,
          values,
        }) => (
          <Form>
            <FormGroup>
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

            <Flex justifyContent="space-between">
              <ImageInput refreshKey={imageInputKey} setImage={setCoverPhoto} />
              <PrimaryActionButton
                isLoading={isSubmitting}
                sx={{ marginTop: 1.5 }}
                type="submit"
              >
                {t('actions.confirm')}
              </PrimaryActionButton>
            </Flex>
          </Form>
        )}
      </Formik>
    </Modal>
  );
};

export default ProposeEventModal;
