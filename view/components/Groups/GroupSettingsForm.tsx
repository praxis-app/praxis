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
import { GroupPrivacy } from '../../constants/group.constants';
import { toastVar } from '../../graphql/cache';
import { UpdateGroupConfigInput } from '../../graphql/gen';
import { GroupSettingsFormFragment } from '../../graphql/groups/fragments/gen/GroupSettingsForm.gen';
import { useUpdateGroupSettingsMutation } from '../../graphql/groups/mutations/gen/UpdateGroupSettings.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';

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
    ratificationThreshold: settings.ratificationThreshold,
    reservationsLimit: settings.reservationsLimit,
    standAsidesLimit: settings.standAsidesLimit,
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
              <Box width="75%">
                <Typography>
                  {t('groups.settings.names.standAsidesLimit')}
                </Typography>

                <Typography
                  fontSize={12}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {t('groups.settings.descriptions.standAsidesLimit')}
                </Typography>
              </Box>

              <Select
                name="standAsidesLimit"
                onChange={handleChange}
                sx={{ color: theme.palette.text.secondary }}
                value={values.standAsidesLimit}
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
              <Box width="75%">
                <Typography>
                  {t('groups.settings.names.reservationsLimit')}
                </Typography>

                <Typography
                  fontSize={12}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {t('groups.settings.descriptions.reservationsLimit')}
                </Typography>
              </Box>

              <Select
                name="reservationsLimit"
                onChange={handleChange}
                sx={{ color: theme.palette.text.secondary }}
                value={values.reservationsLimit}
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
              <Box width={isDesktop ? 'initial' : '75%'}>
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

            {settings.isPublic && (
              <Typography
                color="#ffb74d"
                fontSize={12}
                marginTop={1}
                width="80%"
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
