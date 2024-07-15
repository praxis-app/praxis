import {
  Box,
  Divider,
  FormGroup,
  MenuItem,
  Typography,
  useTheme,
} from '@mui/material';
import { Form, Formik, FormikErrors, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import {
  GroupAdminModel,
  GroupPrivacy,
  GroupSettingsFieldName,
} from '../../constants/group.constants';
import { VotingTimeLimit } from '../../constants/proposal.constants';
import { toastVar } from '../../graphql/cache';
import { DecisionMakingModel, UpdateGroupConfigInput } from '../../graphql/gen';
import { GroupSettingsFormFragment } from '../../graphql/groups/fragments/gen/GroupSettingsForm.gen';
import { useUpdateGroupSettingsMutation } from '../../graphql/groups/mutations/gen/UpdateGroupSettings.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import SettingsSelect from '../Settings/SettingsSelect';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import SliderInput from '../Shared/SliderInput';

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
  const isDesktop = useIsDesktop();
  const theme = useTheme();

  const initialValues: FormValues = {
    adminModel: settings.adminModel,
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
  ) => {
    if (values.adminModel === GroupAdminModel.NoAdmin) {
      const answer = window.confirm(t('groups.prompts.confirmNoAdmin'));
      if (!answer) {
        return;
      }
    }
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
  };

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
    if (!Number.isInteger(value)) {
      setFieldValue(fieldName, Math.round(value));
    }
  };

  const handleSliderInputClick = (decisionMakingModel?: string | null) => {
    if (decisionMakingModel === 'CONSENT') {
      toastVar({
        status: 'info',
        title: t('groups.prompts.settingDisabledForConsent'),
      });
    }
  };

  const handleConsensusLimitClick = (decisionMakingModel?: string | null) => {
    if (decisionMakingModel === 'MAJORITY_VOTE') {
      toastVar({
        status: 'info',
        title: t('groups.prompts.settingDisabledForMajority'),
      });
    }
  };

  const validateSettings = ({
    adminModel,
    decisionMakingModel,
    ratificationThreshold,
    votingTimeLimit,
  }: FormValues) => {
    const errors: FormikErrors<FormValues> = {};
    if (
      decisionMakingModel === 'CONSENT' &&
      votingTimeLimit === VotingTimeLimit.Unlimited
    ) {
      errors.votingTimeLimit = t(
        'groups.errors.consentVotingTimeLimitRequired',
      );
    }
    if (
      decisionMakingModel === 'MAJORITY_VOTE' &&
      ratificationThreshold &&
      ratificationThreshold <= 50
    ) {
      errors.ratificationThreshold = t(
        'groups.errors.majorityVoteRatificationThreshold',
      );
    }
    if (adminModel === GroupAdminModel.Rotating) {
      errors.adminModel = t('prompts.inDev');
    }
    return errors;
  };

  return (
    <Formik
      initialValues={initialValues}
      validate={validateSettings}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({
        dirty,
        isSubmitting,
        handleChange,
        values,
        setFieldValue,
        errors,
      }) => (
        <Form>
          <FormGroup>
            <SettingsSelect
              fieldName={GroupSettingsFieldName.AdminModel}
              label={t('groups.settings.names.adminModel')}
              description={t('groups.settings.descriptions.adminModel')}
              value={values.adminModel}
              onChange={handleChange}
              errorMessageProps={{ sx: { marginTop: 1 } }}
              errors={errors}
            >
              <MenuItem value={GroupAdminModel.Standard}>
                {t('groups.labels.standard')}
              </MenuItem>
              <MenuItem value={GroupAdminModel.NoAdmin}>
                {t('groups.labels.noAdmin')}
              </MenuItem>
              <MenuItem value={GroupAdminModel.Rotating}>
                {t('groups.labels.rotatingAdmin')}
              </MenuItem>
            </SettingsSelect>

            <SettingsSelect
              fieldName={GroupSettingsFieldName.DecisionMakingModel}
              label={t('groups.settings.names.decisionMakingModel')}
              description={t(
                'groups.settings.descriptions.decisionMakingModel',
              )}
              errorMessageProps={{ sx: { marginTop: 1 } }}
              errors={errors}
              onChange={handleChange}
              value={values.decisionMakingModel}
            >
              <MenuItem value={DecisionMakingModel.Consensus}>
                {t('groups.labels.consensus')}
              </MenuItem>
              <MenuItem value={DecisionMakingModel.Consent}>
                {t('groups.labels.consent')}
              </MenuItem>
              <MenuItem value={DecisionMakingModel.MajorityVote}>
                {t('groups.labels.majority')}
              </MenuItem>
            </SettingsSelect>

            <SettingsSelect
              description={t('groups.settings.descriptions.standAsidesLimit')}
              disabled={values.decisionMakingModel === 'MAJORITY_VOTE'}
              fieldName={GroupSettingsFieldName.StandAsidesLimit}
              label={t('groups.settings.names.standAsidesLimit')}
              onChange={handleChange}
              onClick={() =>
                handleConsensusLimitClick(values.decisionMakingModel)
              }
              value={values.standAsidesLimit}
            >
              {Array(11)
                .fill(0)
                .map((_, value) => (
                  <MenuItem
                    key={value}
                    value={value}
                    sx={
                      isDesktop
                        ? { width: 75, justifyContent: 'center' }
                        : undefined
                    }
                  >
                    {value}
                  </MenuItem>
                ))}
            </SettingsSelect>

            <SettingsSelect
              description={t('groups.settings.descriptions.reservationsLimit')}
              disabled={values.decisionMakingModel === 'MAJORITY_VOTE'}
              fieldName={GroupSettingsFieldName.ReservationsLimit}
              label={t('groups.settings.names.reservationsLimit')}
              onClick={() =>
                handleConsensusLimitClick(values.decisionMakingModel)
              }
              onChange={handleChange}
              value={values.reservationsLimit}
            >
              {Array(11)
                .fill(0)
                .map((_, value) => (
                  <MenuItem
                    key={value}
                    value={value}
                    sx={
                      isDesktop
                        ? { width: 75, justifyContent: 'center' }
                        : undefined
                    }
                  >
                    {value}
                  </MenuItem>
                ))}
            </SettingsSelect>

            <Flex
              justifyContent="space-between"
              flexDirection={isDesktop ? 'row' : 'column'}
            >
              <Box width={isDesktop ? SETTING_DESCRIPTION_WIDTH : undefined}>
                <Typography>
                  {t('groups.settings.names.ratificationThreshold')}
                </Typography>

                <Typography
                  fontSize={12}
                  sx={{
                    color: theme.palette.text.secondary,
                    paddingBottom: isDesktop ? 0 : 1.25,
                  }}
                >
                  {t('groups.settings.descriptions.ratificationThreshold')}
                </Typography>

                {!!errors.ratificationThreshold && (
                  <Typography
                    color="error"
                    fontSize={12}
                    marginTop={isDesktop ? 1 : 0}
                    marginBottom={isDesktop ? 1.5 : 0.25}
                  >
                    {errors.ratificationThreshold}
                  </Typography>
                )}
              </Box>

              <SliderInput
                marks={!isDesktop}
                disabled={values.decisionMakingModel === 'CONSENT'}
                name={GroupSettingsFieldName.RatificationThreshold}
                onInputChange={handleChange}
                onSliderChange={handleChange}
                value={values.ratificationThreshold}
                width={isDesktop ? 200 : '100%'}
                onInputBlur={() =>
                  handleSliderInputBlur(
                    setFieldValue,
                    values.ratificationThreshold,
                  )
                }
                onClick={() =>
                  handleSliderInputClick(values.decisionMakingModel)
                }
                showPercentSign
              />
            </Flex>

            <Divider sx={{ marginTop: isDesktop ? 3 : 1.2, marginBottom: 3 }} />

            <SettingsSelect
              fieldName={GroupSettingsFieldName.VotingTimeLimit}
              label={t('groups.settings.names.votingTimeLimit')}
              description={t('groups.settings.descriptions.votingTimeLimit')}
              value={values.votingTimeLimit}
              onChange={handleChange}
              errors={errors}
            >
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
              <MenuItem value={VotingTimeLimit.Unlimited}>
                {t('groups.labels.unlimited')}
              </MenuItem>
            </SettingsSelect>

            <SettingsSelect
              fieldName={GroupSettingsFieldName.Privacy}
              label={t('groups.settings.names.privacy')}
              description={t('groups.settings.descriptions.privacy')}
              value={values.privacy}
              onChange={handleChange}
              warningMessage={
                settings.isPublic ? t('groups.prompts.publicGroup') : undefined
              }
            >
              <MenuItem value={GroupPrivacy.Private}>
                {t('groups.labels.private')}
              </MenuItem>
              <MenuItem value={GroupPrivacy.Public}>
                {t('groups.labels.public')}
              </MenuItem>
            </SettingsSelect>
          </FormGroup>

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
