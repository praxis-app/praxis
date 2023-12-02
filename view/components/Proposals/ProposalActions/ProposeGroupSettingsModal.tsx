import {
  Box,
  Divider,
  FormGroup,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { Form, Formik } from 'formik';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GroupPrivacy } from '../../../constants/group.constants';
import {
  ProposalActionFieldName,
  ProposalActionType,
} from '../../../constants/proposal.constants';
import { ProposalActionGroupConfigInput } from '../../../graphql/gen';
import { useGroupSettingsByGroupIdLazyQuery } from '../../../graphql/groups/queries/gen/GroupSettingsByGroupId.gen';
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

  useEffect(() => {
    if (groupId && actionType === ProposalActionType.ChangeSettings) {
      getGroupSettings({ variables: { groupId } });
      setOpen(true);
    }
  }, [groupId, actionType, getGroupSettings]);

  const groupSettings = data?.group.settings;
  const initialValues: ProposalActionGroupConfigInput = {
    privacy: groupSettings?.privacy,
    ratificationThreshold: groupSettings?.ratificationThreshold,
    reservationsLimit: groupSettings?.reservationsLimit,
    standAsidesLimit: groupSettings?.standAsidesLimit,
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleSubmit = async (formValues: ProposalActionGroupConfigInput) => {
    setFieldValue(ProposalActionFieldName.GroupSettings, formValues);
    setOpen(false);
  };

  const handleSliderInputBlur = (
    setFieldValue: (field: string, value: number) => void,
    fieldName: string,
    value?: number | null,
  ) => {
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
        enableReinitialize
      >
        {({ isSubmitting, handleChange, values, dirty, setFieldValue }) => (
          <Form>
            {data && (
              <FormGroup sx={{ paddingTop: 1 }}>
                <Flex justifyContent="space-between">
                  <Box width={SETTING_DESCRIPTION_WIDTH}>
                    <Typography>
                      {t('groups.settings.names.standAsidesLimit')}
                    </Typography>

                    <Typography fontSize={12} sx={{ color: 'text.secondary' }}>
                      {t('groups.settings.descriptions.standAsidesLimit')}
                    </Typography>
                  </Box>

                  <Select
                    name="standAsidesLimit"
                    onChange={handleChange}
                    sx={{ color: 'text.secondary' }}
                    value={values.standAsidesLimit || 0}
                    variant="standard"
                    disableUnderline
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
                  </Select>
                </Flex>

                <Divider sx={{ marginY: 3 }} />

                <Flex justifyContent="space-between">
                  <Box width={SETTING_DESCRIPTION_WIDTH}>
                    <Typography>
                      {t('groups.settings.names.reservationsLimit')}
                    </Typography>

                    <Typography fontSize={12} sx={{ color: 'text.secondary' }}>
                      {t('groups.settings.descriptions.reservationsLimit')}
                    </Typography>
                  </Box>

                  <Select
                    name="reservationsLimit"
                    onChange={handleChange}
                    sx={{ color: 'text.secondary' }}
                    value={values.reservationsLimit || 0}
                    variant="standard"
                    disableUnderline
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
                  </Select>
                </Flex>

                <Divider sx={{ marginY: 3 }} />

                <Flex justifyContent="space-between">
                  <Box width={SETTING_DESCRIPTION_WIDTH}>
                    <Typography>
                      {t('groups.settings.names.ratificationThreshold')}
                    </Typography>

                    <Typography fontSize={12} sx={{ color: 'text.secondary' }}>
                      {t('groups.settings.descriptions.ratificationThreshold')}
                    </Typography>
                  </Box>

                  <SliderInput
                    name="ratificationThreshold"
                    onInputChange={handleChange}
                    onSliderChange={handleChange}
                    value={values.ratificationThreshold || 0}
                    onInputBlur={() =>
                      handleSliderInputBlur(
                        setFieldValue,
                        'ratificationThreshold',
                        values.ratificationThreshold,
                      )
                    }
                  />
                </Flex>

                <Divider sx={{ marginY: 3 }} />

                <Flex justifyContent="space-between">
                  <Box>
                    <Typography>
                      {t('groups.settings.names.privacy')}
                    </Typography>

                    <Typography fontSize={12} color="text.secondary">
                      {t('groups.settings.descriptions.privacy')}
                    </Typography>
                  </Box>

                  <Select
                    name="privacy"
                    onChange={handleChange}
                    sx={{ color: 'text.secondary' }}
                    value={values.privacy || ''}
                    variant="standard"
                    disableUnderline
                  >
                    <MenuItem value={GroupPrivacy.Private}>
                      {t('groups.labels.private')}
                    </MenuItem>
                    <MenuItem value={GroupPrivacy.Public}>
                      {t('groups.labels.public')}
                    </MenuItem>
                  </Select>
                </Flex>
              </FormGroup>
            )}

            {loading && <ProgressBar />}

            <Divider sx={{ marginTop: 3, marginBottom: 2 }} />

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
