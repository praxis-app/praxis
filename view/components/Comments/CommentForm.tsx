import { Image as ImageIcon, Send } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  FilledInput,
  FormGroup,
  IconButton,
  Input,
  SxProps,
} from '@mui/material';
import { Formik, FormikFormProps, FormikHelpers } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FieldNames,
  KeyCodes,
  TypeNames,
} from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { CommentFormFragment } from '../../graphql/comments/fragments/gen/CommentForm.gen';
import { useCreateCommentMutation } from '../../graphql/comments/mutations/gen/CreateComment.gen';
import { useUpdateCommentMutation } from '../../graphql/comments/mutations/gen/UpdateComment.gen';
import { CreateCommentInput, UpdateCommentInput } from '../../graphql/gen';
import { useDeleteImageMutation } from '../../graphql/images/mutations/gen/DeleteImage.gen';
import { isEntityTooLarge } from '../../utils/error.utils';
import { validateImageInput } from '../../utils/image.utils';
import { getRandomString } from '../../utils/shared.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import Flex from '../Shared/Flex';
import UserAvatar from '../Users/UserAvatar';

interface Props extends FormikFormProps {
  questionId?: number;
  editComment?: CommentFormFragment;
  enableAutoFocus?: boolean;
  expanded?: boolean;
  onSubmit?: () => void;
  postId?: number;
  proposalId?: number;
  questionnaireTicketId?: number;
}

const CommentForm = ({
  questionId,
  editComment,
  enableAutoFocus,
  expanded,
  onSubmit,
  postId,
  proposalId,
  questionnaireTicketId,
  ...formProps
}: Props) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagesInputKey, setImagesInputKey] = useState('');
  const [showForm, setShowForm] = useState(expanded);
  const [blurCount, setBlurCount] = useState(0);

  const [createComment, { loading: createCommentLoading }] =
    useCreateCommentMutation();
  const [updateComment, { loading: updateCommentLoading }] =
    useUpdateCommentMutation();
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

  const getTypeName = () => {
    if (proposalId) {
      return TypeNames.Proposal;
    }
    if (questionnaireTicketId) {
      return TypeNames.QuestionnaireTicket;
    }
    if (questionId) {
      return TypeNames.Question;
    }
    return TypeNames.Post;
  };

  const handleCreate = async (
    formValues: CreateCommentInput,
    { resetForm, setSubmitting }: FormikHelpers<CreateCommentInput>,
  ) => {
    const noContent = !formValues.body && !images.length;
    if (noContent || createCommentLoading) {
      return;
    }
    await createComment({
      variables: {
        commentData: {
          ...formValues,
          images,
          postId,
          proposalId,
          questionnaireTicketId,
          questionId,
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
          __typename: getTypeName(),
          id: postId || proposalId || questionnaireTicketId || questionId,
        });
        cache.modify({
          id: cacheId,
          fields: {
            comments(existingRefs, { toReference }) {
              return [...existingRefs, toReference(comment)];
            },
            commentCount(existingCount: number) {
              return existingCount + 1;
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
    { body, ...formValues }: CreateCommentInput | UpdateCommentInput,
    formikHelpers: FormikHelpers<CreateCommentInput | UpdateCommentInput>,
  ) => {
    const values = { body: body?.trim(), ...formValues };
    try {
      if (images) {
        validateImageInput(images);
      }
      if (editComment) {
        await handleUpdate(values, editComment);
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

  const handleInputMount = (input: HTMLInputElement | null) => {
    if (!input || !enableAutoFocus || blurCount) {
      return;
    }
    input.focus();
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
      {({ handleChange, values, submitForm, isSubmitting }) => (
        <Box>
          <FormGroup row>
            <UserAvatar size={35} sx={{ marginRight: 1 }} />

            <Box
              bgcolor="background.secondary"
              borderRadius={4}
              paddingX={1.5}
              paddingY={0.2}
              flex={1}
            >
              <Input
                autoComplete="off"
                name={FieldNames.Body}
                onChange={handleChange}
                inputRef={handleInputMount}
                onBlur={() => setBlurCount(blurCount + 1)}
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
                  disabled={isSubmitting || (!values.body && !images?.length)}
                  sx={sendButtonStyles}
                  onClick={submitForm}
                  edge="end"
                  disableRipple
                >
                  {createCommentLoading || updateCommentLoading ? (
                    <CircularProgress size={10} />
                  ) : (
                    <Send sx={{ fontSize: 20, color: 'text.secondary' }} />
                  )}
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
        </Box>
      )}
    </Formik>
  );
};

export default CommentForm;
