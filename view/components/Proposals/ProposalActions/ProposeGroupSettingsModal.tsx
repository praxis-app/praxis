import { Box, Divider, FormGroup, MenuItem, Typography } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GroupAdminModel,
  GroupPrivacy,
  GroupSettingsFieldName,
} from '../../../constants/group.constants';
import {
  DecisionMakingModel,
  ProposalActionFieldName,
  VotingTimeLimit,
} from '../../../constants/proposal.constants';
import { toastVar } from '../../../graphql/cache';
import { ProposalActionGroupConfigInput } from '../../../graphql/gen';
import { useGroupSettingsByGroupIdLazyQuery } from '../../../graphql/groups/queries/gen/GroupSettingsByGroupId.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import SettingsSelect from '../../Settings/SettingsSelect';
import Flex from '../../Shared/Flex';
import Modal from '../../Shared/Modal';
import PrimaryActionButton from '../../Shared/PrimaryActionButton';
import ProgressBar from '../../Shared/ProgressBar';
import SliderInput from '../../Shared/SliderInput';

const SETTING_DESCRIPTION_WIDTH = '60%';

interface Props {
  actionType?: string;
  groupId?: number | null;
  currentUserId: number;
  onClose(): void;
  setFieldValue: (
    field: ProposalActionFieldName,
    value: ProposalActionGroupConfigInput,
  ) => void;
}

const ProposeGroupSettingsModal = ({
  actionType,
  groupId,
  onClose,
  setFieldValue,
}: Props) => {
  const [open, setOpen] = useState(false);

  const [getGroupSettings, { data, loading }] =
    useGroupSettingsByGroupIdLazyQuery();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    if (groupId && actionType === 'CHANGE_SETTINGS') {
      getGroupSettings({ variables: { groupId } });
      setOpen(true);
    }
  }, [groupId, actionType, getGroupSettings]);

  const groupSettings = data?.group.settings;
  const initialValues: ProposalActionGroupConfigInput = {
    adminModel: groupSettings?.adminModel,
    decisionMakingModel: groupSettings?.decisionMakingModel,
    ratificationThreshold: groupSettings?.ratificationThreshold,
    reservationsLimit: groupSettings?.reservationsLimit,
    standAsidesLimit: groupSettings?.standAsidesLimit,
    votingTimeLimit: groupSettings?.votingTimeLimit,
    privacy: groupSettings?.privacy,
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleSubmit = async (formValues: ProposalActionGroupConfigInput) => {
    const changedValues = Object.keys(formValues).reduce((result, key) => {
      if (formValues[key] !== initialValues[key]) {
        result[key] = formValues[key];
      }
      return result;
    }, {});

    setFieldValue(ProposalActionFieldName.GroupSettings, changedValues);
    setOpen(false);
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
    adminModel,
    decisionMakingModel,
    ratificationThreshold,
    votingTimeLimit,
  }: ProposalActionGroupConfigInput) => {
    const errors: FormikErrors<ProposalActionGroupConfigInput> = {};
    if (
      decisionMakingModel === DecisionMakingModel.Consent &&
      votingTimeLimit === VotingTimeLimit.Unlimited
    ) {
      errors.votingTimeLimit = t(
        'groups.errors.consentVotingTimeLimitRequired',
      );
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
    if (adminModel === GroupAdminModel.Rotating) {
      errors.adminModel = t('prompts.inDev');
    }
    return errors;
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={t('proposals.actionTypes.changeSettings')}
      contentStyles={{ minHeight: 'none' }}
      centeredTitle
    >
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
            {data && (
              <FormGroup sx={{ paddingTop: 1 }}>
                <SettingsSelect
                  fieldName={GroupSettingsFieldName.AdminModel}
                  label={t('groups.settings.names.adminModel')}
                  description={t('groups.settings.descriptions.adminModel')}
                  value={values.adminModel || ''}
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
                  value={values.decisionMakingModel || ''}
                  onChange={handleChange}
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
                  fieldName={GroupSettingsFieldName.StandAsidesLimit}
                  label={t('groups.settings.names.standAsidesLimit')}
                  disabled={
                    values.decisionMakingModel ===
                    DecisionMakingModel.MajorityVote
                  }
                  description={t(
                    'groups.settings.descriptions.standAsidesLimit',
                  )}
                  value={values.standAsidesLimit || 0}
                  onChange={handleChange}
                  onClick={() =>
                    handleConsensusLimitClick(values.decisionMakingModel)
                  }
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
                  fieldName={GroupSettingsFieldName.ReservationsLimit}
                  label={t('groups.settings.names.reservationsLimit')}
                  disabled={
                    values.decisionMakingModel ===
                    DecisionMakingModel.MajorityVote
                  }
                  description={t(
                    'groups.settings.descriptions.reservationsLimit',
                  )}
                  value={values.reservationsLimit || 0}
                  onChange={handleChange}
                  onClick={() =>
                    handleConsensusLimitClick(values.decisionMakingModel)
                  }
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
                  <Box
                    width={isDesktop ? SETTING_DESCRIPTION_WIDTH : undefined}
                  >
                    <Typography>
                      {t('groups.settings.names.ratificationThreshold')}
                    </Typography>

                    <Typography
                      fontSize={12}
                      color="text.primary"
                      paddingBottom={isDesktop ? 0 : 1.25}
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
                    disabled={
                      values.decisionMakingModel === DecisionMakingModel.Consent
                    }
                    name={GroupSettingsFieldName.RatificationThreshold}
                    onClick={() =>
                      handleSliderInputClick(values.decisionMakingModel)
                    }
                    onInputBlur={() =>
                      handleSliderInputBlur(
                        setFieldValue,
                        values.ratificationThreshold,
                      )
                    }
                    onInputChange={handleChange}
                    onSliderChange={handleChange}
                    value={values.ratificationThreshold || 0}
                    width={isDesktop ? 200 : '100%'}
                    showPercentSign
                  />
                </Flex>

                <Divider
                  sx={{ marginTop: isDesktop ? 3 : 1.2, marginBottom: 3 }}
                />

                <SettingsSelect
                  fieldName={GroupSettingsFieldName.VotingTimeLimit}
                  label={t('groups.settings.names.votingTimeLimit')}
                  description={t(
                    'groups.settings.descriptions.votingTimeLimit',
                  )}
                  value={
                    values.votingTimeLimit || values.votingTimeLimit === 0
                      ? values.votingTimeLimit
                      : ''
                  }
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
                  value={values.privacy || ''}
                  onChange={handleChange}
                >
                  <MenuItem value={GroupPrivacy.Private}>
                    {t('groups.labels.private')}
                  </MenuItem>
                  <MenuItem value={GroupPrivacy.Public}>
                    {t('groups.labels.public')}
                  </MenuItem>
                </SettingsSelect>
              </FormGroup>
            )}

            {loading && <ProgressBar />}

            <Flex justifyContent="flex-end" flex={1}>
              <PrimaryActionButton
                isLoading={isSubmitting}
                sx={{ marginTop: 1.5 }}
                disabled={!dirty || isSubmitting}
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

export default ProposeGroupSettingsModal;
