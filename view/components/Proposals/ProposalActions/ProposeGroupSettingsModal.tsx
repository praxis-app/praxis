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
import Flex from '../../Shared/Flex';
import Modal from '../../Shared/Modal';
import PrimaryActionButton from '../../Shared/PrimaryActionButton';

interface Props {
  actionType?: string;
  groupId?: number | null;
  currentUserId: number;
  onClose(): void;
  setFieldValue: (field: ProposalActionFieldName, value: any) => void;
}

const ProposeGroupSettingsModal = ({
  actionType,
  groupId,
  onClose,
  setFieldValue,
}: Props) => {
  const [open, setOpen] = useState(false);

  const { t } = useTranslation();

  useEffect(() => {
    if (groupId && actionType === ProposalActionType.ChangeSettings) {
      setOpen(true);
    }
  }, [groupId, actionType]);

  const initialValues: any = {
    privacy: GroupPrivacy.Private,
  };

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const handleSubmit = async (formValues: any) => {
    setFieldValue(ProposalActionFieldName.Event, formValues);
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
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ isSubmitting, handleChange, values, dirty }) => (
          <Form>
            <FormGroup sx={{ paddingTop: 1 }}>
              <Flex justifyContent="space-between">
                <Box>
                  <Typography>{t('groups.settings.names.privacy')}</Typography>

                  <Typography fontSize={12} color="text.secondary">
                    {t('groups.settings.descriptions.privacy')}
                  </Typography>
                </Box>

                <Select
                  name="privacy"
                  onChange={handleChange}
                  sx={{ color: 'text.secondary' }}
                  value={values.privacy}
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
