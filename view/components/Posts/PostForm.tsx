// TODO: Utilize Formik for image input

import { Divider, FormGroup } from '@mui/material';
import { Form, Formik, FormikFormProps, FormikHelpers } from 'formik';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  FieldNames,
  NavigationPaths,
  TypeNames,
} from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import {
  EventFeedDocument,
  EventFeedQuery,
  EventFeedQueryVariables,
} from '../../graphql/events/queries/gen/EventFeed.gen';
import { CreatePostInput, UpdatePostInput } from '../../graphql/gen';
import {
  GroupFeedDocument,
  GroupFeedQuery,
  GroupFeedQueryVariables,
} from '../../graphql/groups/queries/gen/GroupFeed.gen';
import { useDeleteImageMutation } from '../../graphql/images/mutations/gen/DeleteImage.gen';
import { PostFormFragment } from '../../graphql/posts/fragments/gen/PostForm.gen';
import { useCreatePostMutation } from '../../graphql/posts/mutations/gen/CreatePost.gen';
import { useUpdatePostMutation } from '../../graphql/posts/mutations/gen/UpdatePost.gen';
import {
  HomeFeedDocument,
  HomeFeedQuery,
  HomeFeedQueryVariables,
} from '../../graphql/users/queries/gen/HomeFeed.gen';
import {
  UserProfileFeedDocument,
  UserProfileFeedQuery,
  UserProfileFeedQueryVariables,
} from '../../graphql/users/queries/gen/UserProfileFeed.gen';
import { isEntityTooLarge } from '../../utils/error.utils';
import { validateImageInput } from '../../utils/image.utils';
import { getRandomString } from '../../utils/shared.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import Flex from '../Shared/Flex';
import PrimaryActionButton from '../Shared/PrimaryActionButton';
import TextFieldWithAvatar from '../Shared/TextFieldWithAvatar';

interface Props extends FormikFormProps {
  editPost?: PostFormFragment;
  eventId?: number;
  groupId?: number;
  onSubmit?(): void;
  sharedFromUserId?: number;
  sharedPostId?: number;
  sharedProposalId?: number;
}

const PostForm = ({
  editPost,
  eventId,
  groupId,
  onSubmit,
  sharedFromUserId,
  sharedPostId,
  sharedProposalId,
  ...formProps
}: Props) => {
  const [imagesInputKey, setImagesInputKey] = useState('');
  const [images, setImages] = useState<File[]>([]);

  const [createPost] = useCreatePostMutation();
  const [deleteImage] = useDeleteImageMutation();
  const [updatePost] = useUpdatePostMutation();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const initialValues: CreatePostInput = {
    body: editPost?.body || '',
    sharedFromUserId,
    sharedProposalId,
    sharedPostId,
    eventId,
    groupId,
  };

  const getSubmitBtnLabel = () => {
    if (sharedPostId) {
      return t('posts.actions.sharePost');
    }
    if (sharedProposalId) {
      return t('proposals.actions.shareProposal');
    }
    if (editPost) {
      return t('actions.save');
    }
    return t('actions.post');
  };

  const isSubtmitBtnDisabled = (isSubmitting: boolean, dirty: boolean) => {
    if (isSubmitting) {
      return true;
    }
    if (sharedPostId || sharedProposalId) {
      return false;
    }
    return !dirty && !images.length;
  };

  const handleCreate = async (
    formValues: CreatePostInput,
    { resetForm, setSubmitting }: FormikHelpers<CreatePostInput>,
  ) =>
    await createPost({
      variables: { postData: { ...formValues, images } },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          createPost: { post },
        } = data;
        cache.updateQuery<HomeFeedQuery, HomeFeedQueryVariables>(
          {
            query: HomeFeedDocument,
            variables: {
              limit: 10,
              offset: 0,
              isLoggedIn: true,
              isVerified: true,
            },
          },
          (homePageData) => {
            if (!homePageData) {
              return;
            }
            return produce(homePageData, (draft) => {
              draft.me.homeFeed.nodes.unshift(post);
              draft.me.homeFeed.totalCount = draft.me.homeFeed.totalCount + 1;
            });
          },
        );
        cache.updateQuery<UserProfileFeedQuery, UserProfileFeedQueryVariables>(
          {
            query: UserProfileFeedDocument,
            variables: {
              name: post.user.name,
              isLoggedIn: true,
              limit: 10,
              offset: 0,
            },
          },
          (userProfileFeedData) => {
            if (!userProfileFeedData) {
              return;
            }
            return produce(userProfileFeedData, (draft) => {
              draft.user.profileFeed.unshift(post);
              draft.user.profileFeedCount++;
            });
          },
        );
        if (post.group) {
          cache.updateQuery<GroupFeedQuery, GroupFeedQueryVariables>(
            {
              query: GroupFeedDocument,
              variables: {
                name: post.group.name,
                isLoggedIn: true,
                isVerified: true,
                limit: 10,
                offset: 0,
              },
            },
            (groupFeedData) => {
              if (!groupFeedData) {
                return;
              }
              return produce(groupFeedData, (draft) => {
                draft.group.feed.unshift(post);
                draft.group.feedCount++;
              });
            },
          );
        }
        if (post.event) {
          cache.updateQuery<EventFeedQuery, EventFeedQueryVariables>(
            {
              query: EventFeedDocument,
              variables: {
                eventId: post.event.id,
                isVerified: true,
                limit: 10,
                offset: 0,
              },
            },
            (groupFeedData) => {
              if (!groupFeedData) {
                return;
              }
              return produce(groupFeedData, (draft) => {
                draft.event.posts.unshift(post);
                draft.event.postsCount++;
              });
            },
          );
        }
      },
      onCompleted() {
        resetForm();
        setImages([]);
        setImagesInputKey(getRandomString());
        setSubmitting(false);
      },
    });

  const handleUpdate = async (
    formValues: Omit<UpdatePostInput, 'id'>,
    editPost: PostFormFragment,
  ) => {
    navigate(NavigationPaths.Home);
    await updatePost({
      variables: {
        postData: {
          id: editPost.id,
          ...formValues,
          images,
        },
      },
    });
  };

  const handleSubmit = async (
    { body, ...formValues }: CreatePostInput | UpdatePostInput,
    formikHelpers: FormikHelpers<CreatePostInput | UpdatePostInput>,
  ) => {
    const values = {
      ...formValues,
      body: body?.trim(),
    };

    try {
      validateImageInput(images);

      if (editPost) {
        await handleUpdate(values, editPost);
        return;
      }
      await handleCreate(values, formikHelpers);
    } catch (err) {
      const title = isEntityTooLarge(err)
        ? t('errors.imageTooLarge')
        : String(err);
      toastVar({
        status: 'error',
        title,
      });
    } finally {
      onSubmit?.();
    }
  };

  const handleDeleteSavedImage = async (id: number) => {
    if (editPost) {
      await deleteImage({
        variables: { id },
        update(cache) {
          const cacheId = cache.identify({ id, __typename: TypeNames.Image });
          cache.evict({ id: cacheId });
          cache.gc();
        },
      });
      setImagesInputKey(getRandomString());
    }
  };

  const handleRemoveSelectedImage = (imageName: string) => {
    setImages(images.filter((image) => image.name !== imageName));
    setImagesInputKey(getRandomString());
  };

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
      {...formProps}
    >
      {({ isSubmitting, dirty, handleChange, values }) => (
        <Form>
          <FormGroup>
            <TextFieldWithAvatar
              autoComplete="off"
              name={FieldNames.Body}
              onChange={handleChange}
              placeholder={
                sharedPostId || sharedProposalId
                  ? t('posts.form.saySomething')
                  : t('prompts.whatsHappening')
              }
              value={values.body}
              multiline
            />

            <AttachedImagePreview
              handleDelete={handleDeleteSavedImage}
              handleRemove={handleRemoveSelectedImage}
              savedImages={editPost?.images || []}
              selectedImages={images}
            />
          </FormGroup>

          <Divider sx={{ marginBottom: 1.3 }} />

          <Flex sx={{ justifyContent: sharedPostId ? 'end' : 'space-between' }}>
            {!sharedPostId && (
              <ImageInput
                refreshKey={imagesInputKey}
                setImages={setImages}
                multiple
              />
            )}

            <PrimaryActionButton
              disabled={isSubtmitBtnDisabled(isSubmitting, dirty)}
              isLoading={isSubmitting}
              sx={{ marginTop: 1.5 }}
              type="submit"
            >
              {getSubmitBtnLabel()}
            </PrimaryActionButton>
          </Flex>
        </Form>
      )}
    </Formik>
  );
};

export default PostForm;
