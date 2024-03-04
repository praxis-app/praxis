import {
  Box,
  Divider,
  FormGroup,
  MenuItem,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { Form, Formik, FormikErrors, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../graphql/cache';
import { UpdateServerConfigInput } from '../../graphql/gen';
import { ServerSettingsFormFragment } from '../../graphql/settings/fragments/gen/ServerSettingsForm.gen';
import { useUpdateServerSettingsMutation } from '../../graphql/settings/mutations/gen/UpdateServerSettings.gen';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import { TextField } from '../Shared/TextField';
import SettingsSelect from './SettingsSelect';
import {
  DecisionMakingModel,
  VotingTimeLimit,
} from '../../constants/proposal.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import SliderInput from '../Shared/SliderInput';

const SETTING_DESCRIPTION_WIDTH = '60%';

enum ServerSettingsFormFields {
  CanaryStatement = 'canaryStatement',
  DecisionMakingModel = 'decisionMakingModel',
  RatificationThreshold = 'ratificationThreshold',
  ReservationsLimit = 'reservationsLimit',
  SecurityText = 'securityTxt',
  ServerQuestionsPrompt = 'serverQuestionsPrompt',
  ShowCanaryStatement = 'showCanaryStatement',
  StandAsidesLimit = 'standAsidesLimit',
  VotingTimeLimit = 'votingTimeLimit',
}

type FormValues = Omit<UpdateServerConfigInput, 'id'>;

interface Props {
  serverSettings: ServerSettingsFormFragment;
  canaryStatement: string;
}

const ServerSettingsForm = ({ serverSettings, canaryStatement }: Props) => {
  const [updateServerSettings] = useUpdateServerSettingsMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const theme = useTheme();

  const initialValues: FormValues = {
    decisionMakingModel: serverSettings.decisionMakingModel,
    ratificationThreshold: serverSettings.ratificationThreshold,
    reservationsLimit: serverSettings.reservationsLimit,
    securityTxt: serverSettings.securityTxt,
    serverQuestionsPrompt: serverSettings.serverQuestionsPrompt,
    showCanaryStatement: serverSettings.showCanaryStatement,
    standAsidesLimit: serverSettings.standAsidesLimit,
    votingTimeLimit: serverSettings.votingTimeLimit,
    canaryStatement,
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
  ) =>
    await updateServerSettings({
      variables: {
        serverConfigData: {
          id: serverSettings.id,
          ...values,
        },
      },
      onCompleted() {
        setSubmitting(false);
        resetForm();
      },
      onError() {
        toastVar({
          status: 'error',
          title: t('canary.errors.couldNotUpdate'),
        });
      },
    });

  const handleSliderInputBlur = (
    setFieldValue: (field: string, value: number) => void,
    value?: number | null,
  ) => {
    const fieldName = ServerSettingsFormFields.RatificationThreshold;
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
    if (decisionMakingModel === DecisionMakingModel.Consent) {
      toastVar({
        status: 'info',
        title: t('groups.prompts.settingDisabledForConsent'),
      });
    }
  };

  const handleConsensusLimitClick = (decisionMakingModel?: string | null) => {
    if (decisionMakingModel === DecisionMakingModel.MajorityVote) {
      toastVar({
        status: 'info',
        title: t('groups.prompts.settingDisabledForMajority'),
      });
    }
  };

  const validateSettings = ({
    decisionMakingModel,
    ratificationThreshold,
  }: FormValues) => {
    const errors: FormikErrors<FormValues> = {};

    if (
      decisionMakingModel === DecisionMakingModel.Consent ||
      decisionMakingModel === DecisionMakingModel.MajorityVote
    ) {
      errors.decisionMakingModel = t('prompts.inDev');
    }
    if (
      decisionMakingModel === DecisionMakingModel.MajorityVote &&
      ratificationThreshold &&
      ratificationThreshold <= 50
    ) {
      errors.ratificationThreshold = t(
        'groups.errors.majorityVoteRatificationThreshold',
      );
    }
    return errors;
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validate={validateSettings}
      enableReinitialize
    >
      {({
        dirty,
        errors,
        handleChange,
        isSubmitting,
        setFieldValue,
        values,
      }) => (
        <Form>
          <FormGroup sx={{ marginBottom: 1.5 }}>
            <SettingsSelect
              fieldName={ServerSettingsFormFields.DecisionMakingModel}
              label={t('groups.settings.names.decisionMakingModel')}
              description={t('settings.descriptions.decisionMakingModel')}
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
              disabled={
                values.decisionMakingModel === DecisionMakingModel.MajorityVote
              }
              fieldName={ServerSettingsFormFields.StandAsidesLimit}
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
              disabled={
                values.decisionMakingModel === DecisionMakingModel.MajorityVote
              }
              fieldName={ServerSettingsFormFields.ReservationsLimit}
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
                disabled={
                  values.decisionMakingModel === DecisionMakingModel.Consent
                }
                name={ServerSettingsFormFields.RatificationThreshold}
                onInputChange={handleChange}
                onSliderChange={handleChange}
                value={values.ratificationThreshold}
                width={isDesktop ? 200 : '100%'}
                marks={!isDesktop}
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
              fieldName={ServerSettingsFormFields.VotingTimeLimit}
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

            <Flex justifyContent="space-between" marginBottom={2}>
              <Box>
                <Typography>
                  {t('canary.labels.showCanaryStatement')}
                </Typography>

                <Typography
                  fontSize={12}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {t('canary.descriptions.canaryStatement')}
                </Typography>
              </Box>

              <Switch
                checked={values.showCanaryStatement || false}
                name={ServerSettingsFormFields.ShowCanaryStatement}
                onChange={handleChange}
                sx={{ alignSelf: 'center' }}
              />
            </Flex>

            <Divider sx={{ marginTop: isDesktop ? 1 : 1.2, marginBottom: 3 }} />

            <TextField
              autoComplete="off"
              value={values.canaryStatement || ''}
              disabled={!values.showCanaryStatement}
              label={t('canary.placeholders.canaryStatement')}
              name={ServerSettingsFormFields.CanaryStatement}
              sx={{ marginBottom: 2 }}
              multiline
            />

            <TextField
              autoComplete="off"
              value={values.securityTxt || ''}
              label={t('serverSettings.placeholders.securityTxt')}
              name={ServerSettingsFormFields.SecurityText}
              sx={{ marginBottom: 1.5 }}
              multiline
            />

            <TextField
              autoComplete="off"
              value={values.serverQuestionsPrompt || ''}
              label={t('serverSettings.placeholders.serverQuestionsPrompt')}
              name={ServerSettingsFormFields.ServerQuestionsPrompt}
              sx={{ marginBottom: 1.5 }}
              multiline
            />
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

export default ServerSettingsForm;
