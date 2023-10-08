import { useReactiveVar } from '@apollo/client';
import { Card, CardContent, FormGroup } from '@mui/material';
import { Form, Formik, FormikErrors } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSignUpMutation } from '../../apollo/auth/generated/SignUp.mutation';
import {
  inviteTokenVar,
  isLoggedInVar,
  isNavDrawerOpenVar,
  toastVar,
} from '../../apollo/cache';
import { SignUpInput } from '../../apollo/gen';
import {
  IsFirstUserDocument,
  IsFirstUserQuery,
} from '../../apollo/users/generated/IsFirstUser.query';
import AttachedImagePreview from '../../components/Images/AttachedImagePreview';
import ImageInput from '../../components/Images/ImageInput';
import Flex from '../../components/Shared/Flex';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import PrimaryActionButton from '../../components/Shared/PrimaryActionButton';
import { TextField } from '../../components/Shared/TextField';
import { INVITE_TOKEN } from '../../constants/server-invite.constants';
import { UserFieldNames } from '../../constants/user.constants';
import {
  getRandomString,
  removeLocalStorageItem,
} from '../../utils/shared.utils';
import { useParams } from 'react-router-dom';

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

  const handleSubmit = async (formValues: SignUpInput) => {
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
      onCompleted() {
        inviteTokenVar('');
        isLoggedInVar(true);
        setImageInputKey(getRandomString());
        removeLocalStorageItem(INVITE_TOKEN);
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
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
