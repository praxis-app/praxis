import { useReactiveVar } from '@apollo/client';
import { Card, CardContent, FormGroup } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import AttachedImagePreview from '../../components/Images/AttachedImagePreview';
import ImageInput from '../../components/Images/ImageInput';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import { TextField } from '../../components/Shared/TextField';
import { INVITE_TOKEN } from '../../constants/server-invite.constants';
import { LocalStorageKey } from '../../constants/shared.constants';
import { UserFieldNames } from '../../constants/user.constants';
import { useSignUpMutation } from '../../graphql/auth/mutations/gen/SignUp.gen';
import {
  inviteTokenVar,
  isLoggedInVar,
  isNavDrawerOpenVar,
  toastVar,
} from '../../graphql/cache';
import { SignUpInput } from '../../graphql/gen';
import {
  IsFirstUserDocument,
  IsFirstUserQuery,
} from '../../graphql/users/queries/gen/IsFirstUser.gen';
import { isEntityTooLarge } from '../../utils/error.utils';
import { validateImageInput } from '../../utils/image.utils';
import { getRandomString } from '../../utils/shared.utils';

const SignUpForm = () => {
  const isNavDrawerOpen = useReactiveVar(isNavDrawerOpenVar);
  const [profilePicture, setProfilePicture] = useState<File>();
  const [imageInputKey, setImageInputKey] = useState('');
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

  const validateSignUp = ({
    name,
    email,
    password,
    confirmPassword,
  }: SignUpInput) => {
    const errors: FormikErrors<SignUpInput> = {};
    if (!name) {
      errors.name = t('signUp.errors.missingName');
    }
    if (!email) {
      errors.email = t('signUp.errors.missingEmail');
    }
    if (!password) {
      errors.password = t('signUp.errors.missingPassword');
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = t('signUp.errors.confirmPassword');
    }
    return errors;
  };

  const validateImages = () => {
    try {
      if (profilePicture) {
        validateImageInput(profilePicture);
      }
    } catch (err) {
      toastVar({
        status: 'error',
        title: err.message,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (formValues: SignUpInput) => {
    if (!validateImages()) {
      return;
    }
    await signUp({
      variables: {
        input: {
          ...formValues,
          name: formValues.name.trim(),
          email: formValues.email.trim(),
          profilePicture,
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
      onCompleted({ signUp: { access_token } }) {
        inviteTokenVar('');
        isLoggedInVar(true);
        setImageInputKey(getRandomString());
        localStorage.removeItem(INVITE_TOKEN);
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

  const handleRemoveSelectedImage = () => {
    setProfilePicture(undefined);
    setImageInputKey(getRandomString());
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
          validate={validateSignUp}
        >
          {({ isSubmitting, dirty }) => (
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
                {profilePicture && (
                  <AttachedImagePreview
                    handleRemove={handleRemoveSelectedImage}
                    selectedImages={[profilePicture]}
                  />
                )}
              </FormGroup>

              <Flex sx={{ justifyContent: 'space-between' }}>
                <ImageInput
                  refreshKey={imageInputKey}
                  setImage={setProfilePicture}
                />

                <PrimaryActionButton
                  disabled={isSubmitting || !dirty}
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
