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

  const initialValues: ProposalActionGroupConfigInput = {
    privacy: data?.group.settings.privacy,
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleSubmit = async (formValues: ProposalActionGroupConfigInput) => {
    setFieldValue(ProposalActionFieldName.GroupConfig, formValues);
    setOpen(false);
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
        {({ isSubmitting, handleChange, values, dirty }) => (
          <Form>
            {data && (
              <FormGroup sx={{ paddingTop: 1 }}>
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
