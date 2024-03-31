import { useReactiveVar } from '@apollo/client';
import { Button, Card, CardContent, FormGroup, SxProps } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import { TextField } from '../../components/Shared/TextField';
import {
  LocalStorageKey,
  NavigationPaths,
} from '../../constants/shared.constants';
import { UserFieldNames } from '../../constants/user.constants';
import { useLoginMutation } from '../../graphql/auth/mutations/gen/Login.gen';
import {
  isLoggedInVar,
  isNavDrawerOpenVar,
  toastVar,
} from '../../graphql/cache';
import { LoginInput } from '../../graphql/gen';

const LoginForm = () => {
  const isNavDrawerOpen = useReactiveVar(isNavDrawerOpenVar);
  const [login] = useLoginMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const initialValues: LoginInput = {
    email: '',
    password: '',
  };

  const forgotPasswordBtnStyles: SxProps = {
    textTransform: 'none',
    borderRadius: 9999,
    paddingX: '4px',
  };

  const handleSubmit = async (input: LoginInput) =>
    await login({
      variables: { input },
      onCompleted({ login: { access_token } }) {
        localStorage.setItem(LocalStorageKey.AccessToken, access_token);
        isLoggedInVar(true);
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });

  const validate = ({ email, password }: LoginInput) => {
    const errors: FormikErrors<LoginInput> = {};
    if (!email) {
      errors.email = t('users.errors.missingEmail');
    }
    if (!password) {
      errors.password = t('users.errors.missingPassword');
    }
    return errors;
  };

  return (
    <Card>
      <CardContent sx={{ '&:last-child': { paddingBottom: 2.5 } }}>
        <LevelOneHeading sx={{ marginBottom: 2 }}>
          {t('users.prompts.signInToPost')}
        </LevelOneHeading>

        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validate={validate}
        >
          {({ isSubmitting }) => (
            <Form hidden={isNavDrawerOpen}>
              <FormGroup sx={{ marginBottom: 1 }}>
                <TextField
                  label={t('users.form.email')}
                  name={UserFieldNames.Email}
                />

                <TextField
                  label={t('users.form.password')}
                  name={UserFieldNames.Password}
                  type="password"
                />
              </FormGroup>

              <Flex justifyContent="space-between">
                <Button
                  onClick={() => navigate(NavigationPaths.ForgotPassword)}
                  sx={forgotPasswordBtnStyles}
                >
                  {t('users.labels.forgotPassword')}
                </Button>

                <PrimaryActionButton
                  disabled={isSubmitting}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {t('users.actions.logIn')}
                </PrimaryActionButton>
              </Flex>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
