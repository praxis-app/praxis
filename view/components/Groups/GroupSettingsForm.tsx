import { Warning } from '@mui/icons-material';
import {
  Box,
  Divider,
  FormGroup,
  MenuItem,
  Typography,
  useTheme,
} from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  GroupPrivacy,
  GroupSettingsFieldName,
} from '../../constants/group.constants';
import {
  DecisionMakingModel,
  VotingTimeLimit,
} from '../../constants/proposal.constants';
import { toastVar } from '../../graphql/cache';
import { UpdateGroupConfigInput } from '../../graphql/gen';
import { GroupSettingsFormFragment } from '../../graphql/groups/fragments/gen/GroupSettingsForm.gen';
import { useUpdateGroupSettingsMutation } from '../../graphql/groups/mutations/gen/UpdateGroupSettings.gen';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import SliderInput from '../Shared/SliderInput';
import GroupSettingsSelect from './GroupSettingsSelect';

const SETTING_DESCRIPTION_WIDTH = '60%';

type FormValues = Omit<UpdateGroupConfigInput, 'groupId'>;

interface Props {
  group: GroupSettingsFormFragment;
}

const GroupSettingsForm = ({ group: { id, settings } }: Props) => {
  const [updateSettings] = useUpdateGroupSettingsMutation({
    errorPolicy: 'all',
  });

  const { t } = useTranslation();
  const theme = useTheme();

  const initialValues: FormValues = {
    decisionMakingModel: settings.decisionMakingModel,
    ratificationThreshold: settings.ratificationThreshold,
    reservationsLimit: settings.reservationsLimit,
    standAsidesLimit: settings.standAsidesLimit,
    votingTimeLimit: settings.votingTimeLimit,
    privacy: settings.privacy,
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
  ) =>
    await updateSettings({
      variables: {
        groupConfigData: { groupId: id, ...values },
      },
      onCompleted() {
        setSubmitting(false);
        resetForm();
      },
      onError() {
        toastVar({
          status: 'error',
          title: t('groups.errors.couldNotUpdateSettings'),
        });
      },
    });

  const handleSliderInputBlur = (
    setFieldValue: (field: string, value: number) => void,
    value?: number | null,
  ) => {
    const fieldName = GroupSettingsFieldName.RatificationThreshold;
    if (value === undefined || value === null) {
      return;
    }
    if (value < 0) {
      setFieldValue(fieldName, 0);
      return;
    }
    if (value > 100) {
      setFieldValue(fieldName, 100);
      return;
    }
    if (value % 5 !== 0) {
      setFieldValue(fieldName, Math.round(value / 5) * 5);
      return;
    }
    if (!Number.isInteger(value)) {
      setFieldValue(fieldName, Math.round(value));
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ dirty, isSubmitting, handleChange, values, setFieldValue }) => (
        <Form>
          <FormGroup>
            <GroupSettingsSelect
              fieldName={GroupSettingsFieldName.DecisionMakingModel}
              label={t('groups.settings.names.decisionMakingModel')}
              description={t(
                'groups.settings.descriptions.decisionMakingModel',
              )}
              value={values.decisionMakingModel}
              onChange={handleChange}
            >
              <MenuItem value={DecisionMakingModel.Consensus}>
                {t('groups.labels.consensus')}
              </MenuItem>
              <MenuItem value={DecisionMakingModel.Consent}>
                {t('groups.labels.consent')}
              </MenuItem>
            </GroupSettingsSelect>

            <Divider sx={{ marginY: 3 }} />

            <GroupSettingsSelect
              fieldName={GroupSettingsFieldName.StandAsidesLimit}
              label={t('groups.settings.names.standAsidesLimit')}
              description={t('groups.settings.descriptions.standAsidesLimit')}
              value={values.standAsidesLimit}
              onChange={handleChange}
            >
              {Array(11)
                .fill(0)
                .map((_, value) => (
                  <MenuItem
                    key={value}
                    value={value}
                    sx={{ width: 75, justifyContent: 'center' }}
                  >
                    {value}
                  </MenuItem>
                ))}
            </GroupSettingsSelect>

            <Divider sx={{ marginY: 3 }} />

            <GroupSettingsSelect
              fieldName={GroupSettingsFieldName.ReservationsLimit}
              label={t('groups.settings.names.reservationsLimit')}
              description={t('groups.settings.descriptions.reservationsLimit')}
              value={values.reservationsLimit}
              onChange={handleChange}
            >
              {Array(11)
                .fill(0)
                .map((_, value) => (
                  <MenuItem
                    key={value}
                    value={value}
                    sx={{ width: 75, justifyContent: 'center' }}
                  >
                    {value}
                  </MenuItem>
                ))}
            </GroupSettingsSelect>

            <Divider sx={{ marginY: 3 }} />

            <Flex justifyContent="space-between">
              <Box width={SETTING_DESCRIPTION_WIDTH}>
                <Typography>
                  {t('groups.settings.names.ratificationThreshold')}
                </Typography>

                <Typography
                  fontSize={12}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {t('groups.settings.descriptions.ratificationThreshold')}
                </Typography>
              </Box>

              <SliderInput
                name={GroupSettingsFieldName.RatificationThreshold}
                onInputChange={handleChange}
                onSliderChange={handleChange}
                value={values.ratificationThreshold}
                onInputBlur={() =>
                  handleSliderInputBlur(
                    setFieldValue,
                    values.ratificationThreshold,
                  )
                }
                showPercentSign
              />
            </Flex>

            <Divider sx={{ marginY: 3 }} />

            <GroupSettingsSelect
              fieldName={GroupSettingsFieldName.VotingTimeLimit}
              label={t('groups.settings.names.votingTimeLimit')}
              description={t('groups.settings.descriptions.votingTimeLimit')}
              value={values.votingTimeLimit}
              onChange={handleChange}
            >
              <MenuItem value={VotingTimeLimit.OneMinute}>
                {t('time.minutesFull', { count: 1 })}
              </MenuItem>
              <MenuItem value={VotingTimeLimit.HalfHour}>
                {t('time.minutesFull', { count: 30 })}
              </MenuItem>
              <MenuItem value={VotingTimeLimit.OneHour}>
                {t('time.hoursFull', { count: 1 })}
              </MenuItem>
              <MenuItem value={VotingTimeLimit.HalfDay}>
                {t('time.hoursFull', { count: 12 })}
              </MenuItem>
              <MenuItem value={VotingTimeLimit.OneDay}>
                {t('time.daysFull', { count: 1 })}
              </MenuItem>
              <MenuItem value={VotingTimeLimit.ThreeDays}>
                {t('time.daysFull', { count: 3 })}
              </MenuItem>
              <MenuItem value={VotingTimeLimit.OneWeek}>
                {t('time.weeks', { count: 1 })}
              </MenuItem>
              <MenuItem value={VotingTimeLimit.TwoWeeks}>
                {t('time.weeks', { count: 2 })}
              </MenuItem>
            </GroupSettingsSelect>

            <Divider sx={{ marginY: 3 }} />

            <GroupSettingsSelect
              fieldName={GroupSettingsFieldName.Privacy}
              label={t('groups.settings.names.privacy')}
              description={t('groups.settings.descriptions.privacy')}
              value={values.privacy}
              onChange={handleChange}
            >
              <MenuItem value={GroupPrivacy.Private}>
                {t('groups.labels.private')}
              </MenuItem>
              <MenuItem value={GroupPrivacy.Public}>
                {t('groups.labels.public')}
              </MenuItem>
            </GroupSettingsSelect>

            {settings.isPublic && (
              <Typography
                color="#ffb74d"
                fontSize={12}
                marginTop={1}
                width={SETTING_DESCRIPTION_WIDTH}
              >
                <Warning
                  sx={{
                    fontSize: 14,
                    marginBottom: -0.3,
                    marginRight: '0.5ch',
                  }}
                />
                {t('groups.prompts.publicGroup')}
              </Typography>
            )}
          </FormGroup>

          <Divider sx={{ marginY: 3 }} />

          <Flex flexEnd>
            <PrimaryActionButton
              disabled={isSubmitting || !dirty}
              isLoading={isSubmitting}
              type="submit"
            >
              {t('actions.save')}
            </PrimaryActionButton>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default GroupSettingsForm;
