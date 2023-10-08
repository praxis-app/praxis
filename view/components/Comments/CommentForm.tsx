import { Image as ImageIcon, Send } from '@mui/icons-material';
import {
  Box,
  FilledInput,
  FormGroup,
  IconButton,
  Input,
  SxProps,
} from '@mui/material';
import { Form, Formik, FormikFormProps, FormikHelpers } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../apollo/cache';
import { CommentFormFragment } from '../../apollo/comments/generated/CommentForm.fragment';
import { useCreateCommentMutation } from '../../apollo/comments/generated/CreateComment.mutation';
import { useUpdateCommentMutation } from '../../apollo/comments/generated/UpdateComment.mutation';
import { CreateCommentInput, UpdateCommentInput } from '../../apollo/gen';
import { useDeleteImageMutation } from '../../apollo/images/generated/DeleteImage.mutation';
import {
  FieldNames,
  KeyCodes,
  TypeNames,
} from '../../constants/shared.constants';
import { getRandomString } from '../../utils/shared.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import Flex from '../Shared/Flex';
import UserAvatar from '../Users/UserAvatar';

interface Props extends FormikFormProps {
  editComment?: CommentFormFragment;
  enableAutoFocus?: boolean;
  expanded?: boolean;
  onSubmit?: () => void;
  postId?: number;
  proposalId?: number;
}

const CommentForm = ({
  editComment,
  enableAutoFocus,
  expanded,
  onSubmit,
  postId,
  proposalId,
  ...formProps
}: Props) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagesInputKey, setImagesInputKey] = useState('');
  const [showForm, setShowForm] = useState(expanded);

  const [createComment] = useCreateCommentMutation();
  const [updateComment] = useUpdateCommentMutation();
  const [deleteImage] = useDeleteImageMutation();

  const { t } = useTranslation();

  const initialValues: CreateCommentInput = {
    body: editComment?.body || '',
  };

  const inputStyles: SxProps = {
    borderRadius: 8,
    paddingY: 0.8,
    width: '100%',
  };
  const filledInputStyles: SxProps = {
    borderRadius: 8,
    marginBottom: 1.25,
    width: '100%',
  };
  const sendButtonStyles: SxProps = {
    width: 40,
    height: 40,
    transform: 'translateY(5px)',
  };

  const handleCreate = async (
    formValues: CreateCommentInput,
    { resetForm, setSubmitting }: FormikHelpers<CreateCommentInput>,
  ) => {
    if (!formValues.body && !images?.length) {
      return;
    }
    await createComment({
      variables: {
        commentData: {
          ...formValues,
          proposalId,
          postId,
          images,
        },
      },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          createComment: { comment },
        } = data;

        const cacheId = cache.identify({
          __typename: postId ? TypeNames.Post : TypeNames.Proposal,
          id: postId || proposalId,
        });
        cache.modify({
          id: cacheId,
          fields: {
            comments(existingRefs, { toReference }) {
              return [...existingRefs, toReference(comment)];
            },
          },
        });
      },
      onCompleted() {
        resetForm();
        setSubmitting(false);
        setImages([]);
        setImagesInputKey(getRandomString());

        if (onSubmit) {
          onSubmit();
        }
      },
    });
  };

  const handleUpdate = async (
    formValues: Omit<UpdateCommentInput, 'id'>,
    editComment: CommentFormFragment,
  ) => {
    await updateComment({
      variables: {
        commentData: {
          id: editComment.id,
          ...formValues,
        },
      },
      onCompleted() {
        if (onSubmit) {
          onSubmit();
        }
      },
    });
  };

  const handleSubmit = async (
    formValues: CreateCommentInput | UpdateCommentInput,
    formikHelpers: FormikHelpers<CreateCommentInput | UpdateCommentInput>,
  ) => {
    try {
      if (editComment) {
        await handleUpdate(formValues, editComment);
        return;
      }
      await handleCreate(formValues, formikHelpers);
    } catch (err) {
      toastVar({
        status: 'error',
        title: String(err),
      });
    }
  };

  const handleFilledInputKeyDown = (
    e: React.KeyboardEvent,
    submitForm: () => void,
  ) => {
    if (e.code !== KeyCodes.Enter) {
      return;
    }
    if (e.shiftKey) {
      return;
    }
    e.preventDefault();
    submitForm();
  };

  const handleDeleteSavedImage = async (id: number) => {
    if (editComment) {
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

  if (!showForm) {
    return (
      <Flex>
        <UserAvatar size={35} sx={{ marginRight: 1 }} />

        <Box position="relative" flex={1} onClick={() => setShowForm(true)}>
          <FilledInput
            placeholder={t('comments.prompts.writeComment')}
            sx={filledInputStyles}
            inputProps={{ sx: { paddingY: 0.8 } }}
            disableUnderline
          />
          <ImageIcon
            sx={{
              cursor: 'pointer',
              color: 'text.secondary',
              position: 'absolute',
              right: 12,
              top: 6,
            }}
          />
        </Box>
      </Flex>
    );
  }

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      enableReinitialize
      {...formProps}
    >
      {({ handleChange, values, submitForm }) => (
        <Form>
          <FormGroup row>
            <UserAvatar size={35} sx={{ marginRight: 1 }} />

            <Box
              flex={1}
              borderRadius={4}
              paddingX={1.5}
              paddingY={0.2}
              sx={{ backgroundColor: 'background.secondary' }}
            >
              <Input
                autoComplete="off"
                name={FieldNames.Body}
                onChange={handleChange}
                inputRef={(input) => input && enableAutoFocus && input.focus()}
                onKeyDown={(e) => handleFilledInputKeyDown(e, submitForm)}
                placeholder={t('comments.prompts.writeComment')}
                sx={inputStyles}
                value={values.body || ''}
                disableUnderline
                multiline
              />

              <Flex justifyContent="space-between">
                <ImageInput
                  setImages={setImages}
                  refreshKey={imagesInputKey}
                  iconStyles={{ color: 'text.secondary', fontSize: 25 }}
                  multiple
                />

                <IconButton
                  edge="end"
                  sx={sendButtonStyles}
                  type="submit"
                  disableRipple
                >
                  <Send sx={{ fontSize: 20, color: 'text.secondary' }} />
                </IconButton>
              </Flex>
            </Box>
          </FormGroup>

          <AttachedImagePreview
            handleDelete={handleDeleteSavedImage}
            handleRemove={handleRemoveSelectedImage}
            savedImages={editComment?.images || []}
            selectedImages={images}
            sx={{ marginLeft: 5.5 }}
          />
        </Form>
      )}
    </Formik>
  );
};

export default CommentForm;
