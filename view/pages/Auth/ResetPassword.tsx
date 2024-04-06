import { useReactiveVar } from '@apollo/client';
import { Card, CardContent, FormGroup, Typography } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import ProgressBar from '../../components/Shared/ProgressBar';
import { TextField } from '../../components/Shared/TextField';
import {
  LocalStorageKey,
  NavigationPaths,
} from '../../constants/shared.constants';
import { UserFieldNames } from '../../constants/user.constants';
import { useResetPasswordMutation } from '../../graphql/auth/mutations/gen/ResetPassword.gen';
import { useIsValidResetPasswordTokenQuery } from '../../graphql/auth/queries/gen/IsValidResetPasswordToken.gen';
import { isLoggedInVar, isVerifiedVar, toastVar } from '../../graphql/cache';
import { ResetPasswordInput } from '../../graphql/gen';
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
} from '../../constants/auth.constants';

const ResetPassword = () => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const { token } = useParams();
  const [resetPassword] = useResetPasswordMutation();
  const { data, loading, error } = useIsValidResetPasswordTokenQuery({
    variables: { token: token || '' },
    skip: !token,
  });

  const { t } = useTranslation();
  const navigate = useNavigate();

  const initialValues: ResetPasswordInput = {
    password: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: ResetPasswordInput) => {
    await resetPassword({
      variables: {
        input: {
          password: values.password,
          confirmPassword: values.confirmPassword,
          resetPasswordToken: token,
        },
      },
      onCompleted({ resetPassword: { access_token, isVerified } }) {
        if (!token) {
          // TODO: Add support for resetting password for logged in users
          return;
        }
        navigate(NavigationPaths.Home);
        localStorage.setItem(LocalStorageKey.AccessToken, access_token);
        isVerifiedVar(isVerified);
        isLoggedInVar(true);
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });
  };

  const validate = ({ password, confirmPassword }: ResetPasswordInput) => {
    const errors: FormikErrors<ResetPasswordInput> = {};
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = t('users.errors.passwordTooShort');
    }
    if (password.length > MAX_PASSWORD_LENGTH) {
      errors.password = t('users.errors.passwordTooLong');
    }
    if (!password) {
      errors.password = t('users.errors.missingPassword');
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = t('users.errors.confirmPassword');
    }
    if (!confirmPassword) {
      errors.confirmPassword = t('users.errors.missingConfirmPassword');
    }
    return errors;
  };

  if (error || (!isLoggedIn && !token)) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (data && !data.isValidResetPasswordToken) {
    return (
      <Typography>{t('users.errors.invalidResetPasswordToken')}</Typography>
    );
  }

  if (loading) {
    return <ProgressBar />;
  }

  return (
    <Card>
      <CardContent>
        <LevelOneHeading sx={{ marginBottom: 2 }}>
          {t('users.prompts.resetYourPassword')}
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
                  label={t('users.form.newPassword')}
                  name={UserFieldNames.Password}
                  type="password"
                />
                <TextField
                  label={t('users.form.confirmNewPassword')}
                  name={UserFieldNames.ConfirmPassword}
                  type="password"
                />
              </FormGroup>

              <Flex justifyContent="right">
                <PrimaryActionButton
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  sx={{ marginTop: 1.85 }}
                  type="submit"
                >
                  {t('users.actions.resetPassword')}
                </PrimaryActionButton>
              </Flex>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default ResetPassword;
