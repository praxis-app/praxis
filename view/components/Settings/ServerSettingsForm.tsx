import { Box, FormGroup, Switch, Typography, useTheme } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../graphql/cache';
import { ServerSettingsFormFragment } from '../../graphql/settings/fragments/gen/ServerSettingsForm.gen';
import { useUpdateServerSettingsMutation } from '../../graphql/settings/mutations/gen/UpdateServerSettings.gen';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import { TextField } from '../Shared/TextField';

enum ServerSettingsFormFields {
  CanaryMessage = 'canaryMessage',
  ShowCanaryMessage = 'showCanaryMessage',
  CanaryMessageExpiresAt = 'canaryMessageExpiresAt',
}

type FormValues = Omit<ServerSettingsFormFragment, 'id'>;

interface Props {
  serverSettings: ServerSettingsFormFragment;
}

const ServerSettingsForm = ({ serverSettings }: Props) => {
  const [updateServerSettings] = useUpdateServerSettingsMutation();

  const { t } = useTranslation();
  const theme = useTheme();

  const initialValues: FormValues = {
    canaryMessage: serverSettings.canaryMessage,
    showCanaryMessage: serverSettings.showCanaryMessage,
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
          title: t('settings.form.errors.couldNotUpdate'),
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
          <FormGroup sx={{ marginBottom: 1.5 }}>
            <Flex justifyContent="space-between" marginBottom={2}>
              <Box>
                <Typography>
                  {t('settings.form.labels.canaryMessage')}
                </Typography>

                <Typography
                  fontSize={12}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {t('settings.form.descriptions.canaryMessage')}
                </Typography>
              </Box>

              <Switch
                checked={values.showCanaryMessage}
                name={ServerSettingsFormFields.ShowCanaryMessage}
                onChange={handleChange}
              />
            </Flex>

            <TextField
              autoComplete="off"
              value={values.canaryMessage || ''}
              disabled={!values.showCanaryMessage}
              label={t('settings.form.placeholders.canaryMessage')}
              name={ServerSettingsFormFields.CanaryMessage}
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
