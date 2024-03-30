import { useReactiveVar } from '@apollo/client';
import { Card, CardContent, FormGroup } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import { TextField } from '../../components/Shared/TextField';
import { LocalStorageKey } from '../../constants/shared.constants';
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

  const initialValues: LoginInput = {
    email: '',
    password: '',
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
      <CardContent>
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
              <FormGroup>
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

              <Flex flexEnd>
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
