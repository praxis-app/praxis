import {
  Card,
  CardContent,
  FormGroup,
  SxProps,
  Typography,
} from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import ProgressBar from '../../components/Shared/ProgressBar';
import { TextField } from '../../components/Shared/TextField';
import { UserFieldNames } from '../../constants/user.constants';
import { useSendPasswordResetMutation } from '../../graphql/auth/mutations/gen/SendPasswordReset.gen';
import { toastVar } from '../../graphql/cache';
import { useIsDesktop } from '../../hooks/shared.hooks';

interface FormValues {
  email: string;
}

const ForgotPassword = () => {
  const [sendPasswordReset, { data, loading, error }] =
    useSendPasswordResetMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const initialValues: FormValues = {
    email: '',
  };

  const headerStyles: SxProps = {
    fontSize: isDesktop ? 35 : 25,
    marginBottom: isDesktop ? 3 : 2.5,
    marginTop: -1,
  };

  const handleSubmit = async (values: FormValues) => {
    await sendPasswordReset({
      variables: values,
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });
  };

  const validate = ({ email }: FormValues) => {
    const errors: FormikErrors<FormValues> = {};
    if (!email) {
      errors.email = t('users.errors.missingEmail');
    }
    return errors;
  };

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (data) {
    return <Typography>{t('users.prompts.passwordResetEmailSent')}</Typography>;
  }

  return (
    <>
      <LevelOneHeading sx={headerStyles}>
        {t('users.headers.forgotPassword')}
      </LevelOneHeading>

      <Card>
        <CardContent>
          <LevelOneHeading sx={{ marginBottom: 2 }}>
            {t('users.prompts.enterEmailForReset')}
          </LevelOneHeading>

          <Formik
            initialValues={initialValues}
            onSubmit={handleSubmit}
            validate={validate}
          >
            {({ isSubmitting }) => (
              <Form>
                <FormGroup>
                  <TextField
                    label={t('users.form.yourEmail')}
                    name={UserFieldNames.Email}
                    autoComplete="off"
                  />
                </FormGroup>

                <Flex justifyContent="right">
                  <PrimaryActionButton
                    disabled={isSubmitting}
                    isLoading={isSubmitting}
                    sx={{ marginTop: 1.85 }}
                    type="submit"
                  >
                    {t('users.actions.sendEmail')}
                  </PrimaryActionButton>
                </Flex>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </>
  );
};

export default ForgotPassword;
