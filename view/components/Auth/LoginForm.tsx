import { useReactiveVar } from '@apollo/client';
import { Card, CardContent, FormGroup } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useLoginMutation } from '../../apollo/auth/generated/Login.mutation';
import {
  isLoggedInVar,
  isNavDrawerOpenVar,
  toastVar,
} from '../../apollo/cache';
import { LoginInput } from '../../apollo/gen';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import { TextField } from '../../components/Shared/TextField';
import { UserFieldNames } from '../../constants/user.constants';

const LoginForm = () => {
  const [login] = useLoginMutation();
  const isNavDrawerOpen = useReactiveVar(isNavDrawerOpenVar);

  const { t } = useTranslation();

  const initialValues: LoginInput = {
    email: '',
    password: '',
  };

  const handleSubmit = async (input: LoginInput) =>
    await login({
      variables: { input },
      onCompleted() {
        isLoggedInVar(true);
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });

  return (
    <Card>
      <CardContent>
        <LevelOneHeading sx={{ marginBottom: 2 }}>
          {t('users.prompts.signInToPost')}
        </LevelOneHeading>

        <Formik initialValues={initialValues} onSubmit={handleSubmit}>
          {({ dirty, isSubmitting }) => (
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
                  disabled={isSubmitting || !dirty}
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
