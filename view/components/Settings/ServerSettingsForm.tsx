import {
  Box,
  Divider,
  FormGroup,
  Switch,
  Typography,
  useTheme,
} from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../graphql/cache';
import { ServerSettingsFormFragment } from '../../graphql/settings/fragments/gen/ServerSettingsForm.gen';
import { useUpdateServerSettingsMutation } from '../../graphql/settings/mutations/gen/UpdateServerSettings.gen';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';

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
    canaryMessageExpiresAt: serverSettings.canaryMessageExpiresAt,
  };

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
  ) =>
    await updateServerSettings({
      variables: {
        serverConfigData: { id: serverSettings.id, ...values },
      },
      onCompleted() {
        setSubmitting(false);
        resetForm();
      },
      onError() {
        toastVar({
          status: 'error',
          title: t('settings.errors.couldNotUpdate'),
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
            <Flex justifyContent="space-between" marginBottom={2.8}>
              <Box>
                <Typography>{t('settings.labels.canaryMessage')}</Typography>

                <Typography
                  fontSize={12}
                  sx={{ color: theme.palette.text.secondary }}
                >
                  {t('settings.descriptions.canaryMessage')}
                </Typography>
              </Box>

              <Switch
                checked={values.showCanaryMessage}
                name={ServerSettingsFormFields.ShowCanaryMessage}
                onChange={handleChange}
              />
            </Flex>
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

export default ServerSettingsForm;
