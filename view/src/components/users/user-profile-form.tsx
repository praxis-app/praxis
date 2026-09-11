import { api } from '@/client/api-client';
import { validateImageInput } from '@/lib/image.utilts';
import {
  type CurrentUser,
  type UpdateUserProfileReq,
  type UserProfileRes,
} from '@/types/user.types';
import {
  BIO_MAX_LENGTH,
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  VALID_NAME_REGEX,
} from '@/constants/user.constants';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import * as zod from 'zod';
import { handleError } from '../../lib/error.utils';
import { t } from '../../lib/shared.utils';
import { ImageInput } from '../images/image-input';
import { LazyLoadImage } from '../images/lazy-load-image';
import { Button } from '../ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Textarea } from '../ui/textarea';
import { UserAvatar } from './user-avatar';

const userProfileSchema = zod.object({
  name: zod
    .string()
    .min(NAME_MIN_LENGTH, {
      message: t('users.errors.shortName'),
    })
    .max(NAME_MAX_LENGTH, {
      message: t('users.errors.longName'),
    })
    .regex(VALID_NAME_REGEX, {
      message: t('users.errors.invalidName'),
    }),
  displayName: zod
    .string()
    .min(DISPLAY_NAME_MIN_LENGTH, {
      message: t('users.errors.shortDisplayName'),
    })
    .max(DISPLAY_NAME_MAX_LENGTH, {
      message: t('users.errors.longDisplayName'),
    })
    .optional()
    .or(zod.literal('')),
  bio: zod
    .string()
    .max(BIO_MAX_LENGTH, {
      message: t('users.errors.longBio'),
    })
    .optional()
    .or(zod.literal('')),
  profilePicture: zod.instanceof(File).optional(),
  coverPhoto: zod.instanceof(File).optional(),
});

interface Props {
  userProfile: UserProfileRes;
  me: CurrentUser;
}

export const UserProfileForm = ({ userProfile, me }: Props) => {
  const [selectedProfilePicture, setSelectedProfilePicture] = useState<File>();
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState<File>();

  const showCoverPhotoPlaceholder =
    !userProfile.coverPhoto && !selectedCoverPhoto;

  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const form = useForm<zod.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      name: userProfile.name,
      displayName: userProfile.displayName || '',
      bio: userProfile.bio || '',
    },
    mode: 'onChange',
  });

  const { mutate: updateUserProfile, isPending: isUpdatePending } = useMutation(
    {
      mutationFn: async (data: UpdateUserProfileReq) => {
        let profilePicture = me.profilePicture;
        let coverPhoto = userProfile.coverPhoto;

        if (selectedProfilePicture) {
          validateImageInput(selectedProfilePicture);
          const formData = new FormData();
          formData.append('file', selectedProfilePicture);
          const { image } = await api.uploadUserProfilePicture(formData);
          const url = URL.createObjectURL(selectedProfilePicture);
          profilePicture = { ...image, url };
        }

        if (selectedCoverPhoto) {
          validateImageInput(selectedCoverPhoto);
          const formData = new FormData();
          formData.append('file', selectedCoverPhoto);
          const { image } = await api.uploadUserCoverPhoto(formData);
          coverPhoto = image;
        }

        await api.updateUserProfile(data);

        return { ...data, profilePicture, coverPhoto };
      },
      onSuccess: (data) => {
        queryClient.setQueryData<{ user: CurrentUser }>(['me'], (oldData) => {
          if (!oldData) {
            throw new Error('User data not found');
          }

          const nameChanged = oldData.user.name !== data.name;
          const displayChanged = oldData.user.displayName !== data.displayName;
          const profilePictureChanged =
            oldData.user.profilePicture?.id !== data.profilePicture?.id;

          return {
            user: {
              ...oldData.user,
              name: nameChanged ? String(data.name) : oldData.user.name,
              displayName: displayChanged
                ? data.displayName
                : oldData.user.displayName,
              profilePicture: profilePictureChanged
                ? data.profilePicture
                : oldData.user.profilePicture,
            },
          };
        });

        queryClient.setQueryData<{ user: UserProfileRes }>(
          ['users', me.id, 'profile'],
          (oldData) => {
            if (!oldData) {
              throw new Error('User data not found');
            }

            const nameChanged = oldData.user.name !== data.name;
            const displayChanged =
              oldData.user.displayName !== data.displayName;
            const bioChanged = oldData.user.bio !== data.bio;
            const profilePictureChanged =
              oldData.user.profilePicture?.id !== data.profilePicture?.id;
            const coverPhotoChanged =
              oldData.user.coverPhoto?.id !== data.coverPhoto?.id;

            return {
              user: {
                ...oldData.user,
                name: nameChanged ? String(data.name) : oldData.user.name,
                displayName: displayChanged
                  ? data.displayName
                  : oldData.user.displayName,
                bio: bioChanged ? data.bio : oldData.user.bio,
                profilePicture: profilePictureChanged
                  ? data.profilePicture
                  : oldData.user.profilePicture,
                coverPhoto: coverPhotoChanged
                  ? data.coverPhoto
                  : oldData.user.coverPhoto,
              },
            };
          },
        );

        form.reset(form.getValues());
        setSelectedProfilePicture(undefined);
        setSelectedCoverPhoto(undefined);
        toast(t('users.actions.profileUpdated'));
      },
      onError: (error: Error) => {
        handleError(error);
      },
    },
  );

  const handleImageChange = (files: File[]) => {
    if (files.length === 0) {
      setSelectedProfilePicture(undefined);
      return;
    }
    setSelectedProfilePicture(files[0]);
  };

  const handleCoverPhotoChange = (files: File[]) => {
    if (files.length === 0) {
      setSelectedCoverPhoto(undefined);
      return;
    }
    setSelectedCoverPhoto(files[0]);
  };

  const getProfilePictureSrc = () => {
    if (selectedProfilePicture) {
      return URL.createObjectURL(selectedProfilePicture);
    }
    return me.profilePicture?.url;
  };

  const getCoverPhotoSrc = () => {
    if (selectedCoverPhoto) {
      return URL.createObjectURL(selectedCoverPhoto);
    }
    return '';
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((v) => updateUserProfile(v))}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <FormLabel>{t('users.form.profilePicture')}</FormLabel>
            <ImageInput
              onChange={handleImageChange}
              disabled={isUpdatePending}
              iconClassName="text-muted-foreground size-5"
            >
              <button
                type="button"
                disabled={isUpdatePending}
                className="text-foreground cursor-pointer text-sm uppercase disabled:opacity-50"
              >
                {t('actions.edit')}
              </button>
            </ImageInput>
          </div>
          <div className="relative self-center">
            <UserAvatar
              name={userProfile.name}
              userId={userProfile.id}
              imageSrc={getProfilePictureSrc()}
              className="size-34"
              fallbackClassName="text-2xl"
            />
            <ImageInput
              onChange={handleImageChange}
              disabled={isUpdatePending}
              iconClassName="text-muted-foreground size-5"
            >
              <button
                type="button"
                disabled={isUpdatePending}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-full bg-black/50 text-sm text-white opacity-0 transition-opacity hover:bg-black/60 hover:opacity-100 disabled:opacity-50"
              >
                {getProfilePictureSrc()
                  ? t('users.actions.changePicture')
                  : t('users.actions.selectPicture')}
              </button>
            </ImageInput>
          </div>
        </div>

        <Separator className="my-1" />

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <FormLabel>{t('users.form.coverPhoto')}</FormLabel>
            <ImageInput
              onChange={handleCoverPhotoChange}
              disabled={isUpdatePending}
              iconClassName="text-muted-foreground size-5"
            >
              <button
                type="button"
                disabled={isUpdatePending}
                className="text-foreground cursor-pointer text-sm uppercase disabled:opacity-50"
              >
                {t('actions.edit')}
              </button>
            </ImageInput>
          </div>
          <div className="relative">
            {showCoverPhotoPlaceholder ? (
              <div className="bg-muted flex h-32 w-full items-center justify-center rounded-lg border">
                <span className="text-muted-foreground text-sm">
                  {t('users.placeholders.coverPhoto')}
                </span>
              </div>
            ) : (
              <LazyLoadImage
                src={getCoverPhotoSrc()}
                imageId={userProfile.coverPhoto?.id}
                userId={userProfile.id}
                alt={t('users.form.coverPhoto')}
                className="h-32 w-full rounded-lg border object-cover"
              />
            )}
            <ImageInput
              onChange={handleCoverPhotoChange}
              disabled={isUpdatePending}
              iconClassName="text-muted-foreground size-5"
            >
              <button
                type="button"
                disabled={isUpdatePending}
                className="absolute inset-0 flex cursor-pointer items-center justify-center rounded-lg bg-black/50 text-sm text-white opacity-0 transition-opacity hover:bg-black/60 hover:opacity-100 disabled:opacity-50"
              >
                {showCoverPhotoPlaceholder
                  ? t('users.actions.selectCoverPhoto')
                  : t('users.actions.changeCoverPhoto')}
              </button>
            </ImageInput>
          </div>
        </div>

        <Separator className="my-1" />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('users.form.name')}</FormLabel>
              <FormControl>
                <Input {...field} placeholder={t('users.placeholders.name')} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="displayName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('users.form.displayName')}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder={t('users.placeholders.displayName')}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('users.form.bio')}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={t('users.placeholders.bio')}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={
            isUpdatePending ||
            !form.formState.isValid ||
            (!form.formState.isDirty &&
              !selectedProfilePicture &&
              !selectedCoverPhoto)
          }
        >
          {t('users.actions.save')}
        </Button>
      </form>
    </Form>
  );
};
