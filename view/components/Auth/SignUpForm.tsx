import { useReactiveVar } from '@apollo/client';
import { Card, CardContent, FormGroup } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import { TextField } from '../../components/Shared/TextField';
import { LocalStorageKey } from '../../constants/shared.constants';
import {
  MIN_PASSWORD_LENGTH,
  UserFieldNames,
  VALID_EMAIL_REGEX,
} from '../../constants/user.constants';
import { useSignUpMutation } from '../../graphql/auth/mutations/gen/SignUp.gen';
import {
  inviteTokenVar,
  isLoggedInVar,
  isNavDrawerOpenVar,
  isVerifiedVar,
  toastVar,
} from '../../graphql/cache';
import { SignUpInput } from '../../graphql/gen';
import {
  IsFirstUserDocument,
  IsFirstUserQuery,
} from '../../graphql/users/queries/gen/IsFirstUser.gen';
import { isEntityTooLarge } from '../../utils/error.utils';

const SignUpForm = () => {
  const isNavDrawerOpen = useReactiveVar(isNavDrawerOpenVar);
  const [signUp] = useSignUpMutation();

  const { token } = useParams();
  const { t } = useTranslation();

  const initialValues: SignUpInput = {
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
    inviteToken: token,
  };

  const handleSubmit = async (formValues: SignUpInput) => {
    await signUp({
      variables: {
        input: {
          ...formValues,
          name: formValues.name.trim(),
          email: formValues.email.trim(),
        },
      },
      update(cache, { data }) {
        if (!data?.signUp) {
          return;
        }
        cache.writeQuery<IsFirstUserQuery>({
          data: { isFirstUser: false },
          query: IsFirstUserDocument,
        });
      },
      onCompleted({ signUp: { access_token, isVerified } }) {
        inviteTokenVar('');
        isLoggedInVar(true);
        isVerifiedVar(isVerified);
        localStorage.removeItem(LocalStorageKey.InviteToken);
        localStorage.setItem(LocalStorageKey.AccessToken, access_token);
      },
      onError(err) {
        const title = isEntityTooLarge(err)
          ? t('errors.imageTooLarge')
          : err.message;
        toastVar({
          status: 'error',
          title,
        });
      },
    });
  };

  const validate = ({
    name,
    email,
    password,
    confirmPassword,
  }: SignUpInput) => {
    const errors: FormikErrors<SignUpInput> = {};
    if (!name) {
      errors.name = t('users.errors.missingName');
    }
    if (!email.match(VALID_EMAIL_REGEX)) {
      errors.email = t('users.errors.invalidEmail');
    }
    if (!email) {
      errors.email = t('users.errors.missingEmail');
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      errors.password = t('users.errors.passwordLength');
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

  return (
    <Card>
      <CardContent>
        <LevelOneHeading sx={{ marginBottom: 2 }}>
          {t('prompts.welcomeToPraxis')}
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
                  label={t('users.form.name')}
                  name={UserFieldNames.Name}
                />
                <TextField
                  label={t('users.form.password')}
                  name={UserFieldNames.Password}
                  type="password"
                />
                <TextField
                  label={t('users.form.confirmPassword')}
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
                  {t('users.actions.signUp')}
                </PrimaryActionButton>
              </Flex>
            </Form>
          )}
        </Formik>
      </CardContent>
    </Card>
  );
};

export default SignUpForm;
