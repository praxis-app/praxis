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
import { UpdateServerConfigInput } from '../../graphql/gen';
import { ServerSettingsFormFragment } from '../../graphql/settings/fragments/gen/ServerSettingsForm.gen';
import { useUpdateServerSettingsMutation } from '../../graphql/settings/mutations/gen/UpdateServerSettings.gen';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';

type FormValues = Omit<UpdateServerConfigInput, 'id'>;

interface Props {
  serverSettings: ServerSettingsFormFragment;
}

const ServerSettingsForm = ({ serverSettings }: Props) => {
  const [updateServerSettings] = useUpdateServerSettingsMutation();

  const { t } = useTranslation();
  const theme = useTheme();

  const initialValues: FormValues = {
    canaryMessage: '',
    canaryMessageExpiresAt: '',
    showCanaryMessage: false,
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
      {({ dirty, isSubmitting }) => (
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

              <Switch checked={true} />
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
