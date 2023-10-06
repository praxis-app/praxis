import { Warning } from '@mui/icons-material';
import {
  Box,
  Divider,
  FormGroup,
  MenuItem,
  Select,
  Typography,
  useTheme,
} from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../apollo/cache';
import { UpdateGroupConfigInput } from '../../apollo/gen';
import { GroupSettingsFormFragment } from '../../apollo/groups/generated/GroupSettingsForm.fragment';
import { useUpdateGroupSettingsMutation } from '../../apollo/groups/generated/UpdateGroupSettings.mutation';
import { GroupPrivacy } from '../../constants/group.constants';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';

type FormValues = Omit<UpdateGroupConfigInput, 'groupId'>;

interface Props {
  group: GroupSettingsFormFragment;
}

const GroupSettingsForm = ({ group }: Props) => {
  const [updateSettings] = useUpdateGroupSettingsMutation({
    errorPolicy: 'all',
  });
  const { t } = useTranslation();
  const theme = useTheme();

  const initialValues: FormValues = {
    privacy: group.settings.isPublic
      ? GroupPrivacy.Public
      : GroupPrivacy.Private,
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
  ) =>
    await updateSettings({
      variables: {
        groupConfigData: { groupId: group.id, ...values },
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

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
    >
      {({ dirty, isSubmitting, handleChange, values }) => (
        <Form>
          <FormGroup>
            <Flex justifyContent="space-between">
              <Box>
                <Typography>{t('groups.settings.names.privacy')}</Typography>

                <Typography
                  fontSize={12}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {t('groups.settings.descriptions.privacy')}
                </Typography>
              </Box>

              <Select
                name="privacy"
                onChange={handleChange}
                sx={{ color: theme.palette.text.secondary }}
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

            {group.settings.isPublic && (
              <Typography fontSize={12} color="error" marginTop={1} width="80%">
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
