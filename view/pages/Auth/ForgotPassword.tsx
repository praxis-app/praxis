import { Card, CardContent, FormGroup, SxProps } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import { TextField } from '../../components/Shared/TextField';
import { UserFieldNames } from '../../constants/user.constants';
import { useSendPasswordResetMutation } from '../../graphql/auth/mutations/gen/SendPasswordReset.gen';
import { toastVar } from '../../graphql/cache';
import { useIsDesktop } from '../../hooks/shared.hooks';

const ForgotPassword = () => {
  const [sendPasswordReset] = useSendPasswordResetMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const initialValues = {
    email: '',
  };

  const headerStyles: SxProps = {
    fontSize: isDesktop ? 35 : 25,
    marginBottom: isDesktop ? 3 : 2.5,
    marginTop: -1,
  };

  const handleSubmit = async (values: typeof initialValues) => {
    await sendPasswordReset({
      variables: values,
      onCompleted() {},
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });
  };

  const validate = ({ email }: typeof initialValues) => {
    const errors: FormikErrors<typeof initialValues> = {};
    if (!email) {
      errors.email = t('users.errors.missingEmail');
    }
    return errors;
  };

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
