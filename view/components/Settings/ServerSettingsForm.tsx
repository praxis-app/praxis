import { Box, FormGroup, Switch, Typography, useTheme } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import { UpdateServerConfigInput } from '../../../src/server-configs/models/update-server-config.input';
import { toastVar } from '../../graphql/cache';
import { ServerSettingsFormFragment } from '../../graphql/settings/fragments/gen/ServerSettingsForm.gen';
import { useUpdateServerSettingsMutation } from '../../graphql/settings/mutations/gen/UpdateServerSettings.gen';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import { TextField } from '../Shared/TextField';

enum ServerSettingsFormFields {
  CanaryStatement = 'canaryStatement',
  ShowCanaryStatement = 'showCanaryStatement',
}

type FormValues = Omit<UpdateServerConfigInput, 'id'>;

interface Props {
  serverSettings: ServerSettingsFormFragment;
  canaryStatement: string;
}

const ServerSettingsForm = ({ serverSettings, canaryStatement }: Props) => {
  const [updateServerSettings] = useUpdateServerSettingsMutation();

  const { t } = useTranslation();
  const theme = useTheme();

  const initialValues: FormValues = {
    showCanaryStatement: serverSettings.showCanaryStatement,
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
                checked={values.showCanaryStatement}
                name={ServerSettingsFormFields.ShowCanaryStatement}
                onChange={handleChange}
              />
            </Flex>

            <TextField
              autoComplete="off"
              value={values.canaryStatement || ''}
              disabled={!values.showCanaryStatement}
              label={t('canary.placeholders.canaryStatement')}
              name={ServerSettingsFormFields.CanaryStatement}
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
