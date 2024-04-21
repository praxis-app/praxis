import { useReactiveVar } from '@apollo/client';
import { Divider, FormGroup, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { UserFieldNames } from '../../constants/user.constants';
import { isVerifiedVar, toastVar } from '../../graphql/cache';
import { UpdateUserInput } from '../../graphql/gen';
import { EditProfileFormFragment } from '../../graphql/users/fragments/gen/EditProfileForm.gen';
import { useUpdateUserMutation } from '../../graphql/users/mutations/gen/UpdateUser.gen';
import { DarkMode } from '../../styles/theme';
import { isEntityTooLarge } from '../../utils/error.utils';
import { validateImageInput } from '../../utils/image.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import CoverPhoto from '../Images/CoverPhoto';
import ImageInput from '../Images/ImageInput';
import Center from '../Shared/Center';
import CompactButton from '../Shared/CompactButton';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import { TextField } from '../Shared/TextField';
import UserAvatar from './UserAvatar';

interface Props {
  user: EditProfileFormFragment;
  submitButtonText: string;
}

const EditProfileForm = ({ user, submitButtonText }: Props) => {
  const [coverPhoto, setCoverPhoto] = useState<File>();
  const [profilePicture, setProfilePicture] = useState<File>();
  const isVerified = useReactiveVar(isVerifiedVar);

  const [updateUser] = useUpdateUserMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const initialValues: Omit<UpdateUserInput, 'id'> = {
    displayName: user.displayName || '',
    name: user.name || '',
    bio: user.bio || '',
  };

  const validateImages = () => {
    try {
      if (profilePicture) {
        validateImageInput(profilePicture);
      }
      if (coverPhoto) {
        validateImageInput(coverPhoto);
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

  const handleSubmit = async (formValues: Omit<UpdateUserInput, 'id'>) => {
    if (!validateImages()) {
      return;
    }
    await updateUser({
      variables: {
        userData: {
          ...formValues,
          name: formValues.name.trim(),
          profilePicture,
          coverPhoto,
        },
      },
      onCompleted({ updateUser: { user } }) {
        const path = getUserProfilePath(user.name);
        navigate(path);
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

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ isSubmitting, dirty }) => (
        <Form>
          <Flex
            sx={{ justifyContent: 'space-between', marginBottom: 2 }}
            onClick={() => {
              if (!isVerified) {
                toastVar({
                  status: 'info',
                  title: t('users.prompts.verifyToUpdateProfilePicture'),
                });
              }
            }}
          >
            <Typography color={isVerified ? 'primary' : DarkMode.Excalibur}>
              {t('users.form.profilePicture')}
            </Typography>
            <ImageInput setImage={setProfilePicture} disabled={!isVerified}>
              <CompactButton sx={{ marginTop: -0.5 }} disabled={!isVerified}>
                {t('actions.edit')}
              </CompactButton>
            </ImageInput>
          </Flex>

          <Center sx={{ marginBottom: 3 }}>
            <UserAvatar
              imageFile={profilePicture}
              sx={{ width: 140, height: 140 }}
              user={user}
            />
          </Center>

          <Divider sx={{ marginBottom: 1.5 }} />

          <Flex
            sx={{ justifyContent: 'space-between', marginBottom: 1.25 }}
            onClick={() => {
              if (!isVerified) {
                toastVar({
                  status: 'info',
                  title: t('users.prompts.verifyToUpdateCoverPhoto'),
                });
              }
            }}
          >
            <Typography color={isVerified ? 'primary' : DarkMode.Excalibur}>
              {t('users.form.coverPhoto')}
            </Typography>
            <ImageInput setImage={setCoverPhoto} disabled={!isVerified}>
              <CompactButton sx={{ marginTop: -0.5 }} disabled={!isVerified}>
                {t('actions.edit')}
              </CompactButton>
            </ImageInput>
          </Flex>

          <CoverPhoto
            imageFile={coverPhoto}
            imageId={user.coverPhoto?.id}
            sx={{ marginBottom: 3 }}
            rounded
          />

          <Divider sx={{ marginBottom: 3 }} />

          <FormGroup>
            <TextField
              autoComplete="off"
              label={t('users.form.username')}
              name={UserFieldNames.Name}
            />
            <TextField
              autoComplete="off"
              label={t('users.form.displayName')}
              name={UserFieldNames.DisplayName}
            />
            <TextField
              autoComplete="off"
              label={t('users.form.bio')}
              name={UserFieldNames.Bio}
              multiline
            />
          </FormGroup>

          <Flex flexEnd>
            <PrimaryActionButton
              disabled={
                isSubmitting || (!dirty && !profilePicture && !coverPhoto)
              }
              isLoading={isSubmitting}
              type="submit"
            >
              {submitButtonText}
            </PrimaryActionButton>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default EditProfileForm;
