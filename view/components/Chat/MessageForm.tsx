import { Send } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Container,
  FormGroup,
  IconButton,
  Input,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';
import { Formik, FormikErrors, FormikHelpers } from 'formik';
import { produce } from 'immer';
import { RefObject, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldNames, KeyCodes } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { useSendMessageMutation } from '../../graphql/chat/mutations/gen/SendMessage.gen';
import {
  VibeChatDocument,
  VibeChatQuery,
} from '../../graphql/chat/queries/gen/VibeChat.gen';
import { SendMessageInput } from '../../graphql/gen';
import {
  GroupChatDocument,
  GroupChatQuery,
  GroupChatQueryVariables,
} from '../../graphql/groups/queries/gen/GroupChat.gen';
import { useIsDesktop, useWindowSize } from '../../hooks/shared.hooks';
import { getRandomString } from '../../utils/shared.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import Flex from '../Shared/Flex';

interface Props {
  conversationId: number;
  formRef: RefObject<HTMLDivElement>;
  groupName?: string;
  onSubmit?(): void;
  setFormHeight(height: number): void;
  vibeChat?: boolean;
}

const MessageForm = ({
  conversationId,
  formRef,
  groupName,
  onSubmit,
  setFormHeight,
  vibeChat,
}: Props) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagesInputKey, setImagesInputKey] = useState('');
  const [sendMessage, { loading }] = useSendMessageMutation();

  const { t } = useTranslation();
  const [windowWidth] = useWindowSize();
  const isDesktop = useIsDesktop();
  const theme = useTheme();

  const initialValues = {
    [FieldNames.Body]: '',
    conversationId,
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!formRef.current) {
        return;
      }
      const { clientHeight } = formRef.current;
      setFormHeight(clientHeight);
    }, 1);

    return () => {
      clearTimeout(timer);
    };
  }, [images, formRef, setFormHeight, windowWidth]);

  const containerStyles: SxProps = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    [theme.breakpoints.up('xs')]: {
      paddingTop: 0,
    },
    [theme.breakpoints.up('md')]: {
      paddingBottom: '80px',
    },
    [theme.breakpoints.up('lg')]: {
      paddingBottom: '14px',
    },
  };
  const formStyles: SxProps = {
    position: isDesktop ? undefined : 'fixed',
    bottom: isDesktop ? undefined : '65px',
    left: isDesktop ? undefined : 0,
    bgcolor: 'background.paper',
    paddingY: isDesktop ? 0.6 : 1,
    paddingX: isDesktop ? 0.5 : 0.9,
    borderRadius: isDesktop ? 4 : 0,
    maxWidth: isDesktop ? undefined : '100%',
    width: '100%',
  };
  const hiderStyles: SxProps = {
    bgcolor: 'background.default',
    marginX: 3,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '95px',
    zIndex: -1,
  };
  const inputStyles: SxProps = {
    borderRadius: 8,
    paddingY: 0.8,
    width: '100%',
  };
  const sendButtonStyles: SxProps = {
    width: 40,
    height: 40,
    transform: 'translateY(5px)',
  };

  const handleSubmit = async (
    values: SendMessageInput,
    { resetForm }: FormikHelpers<SendMessageInput>,
  ) => {
    const noContent = !values.body && !images.length;
    if (noContent || loading) {
      return;
    }
    await sendMessage({
      variables: {
        messageData: { ...values, images },
      },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          sendMessage: { message },
        } = data;
        if (groupName) {
          cache.updateQuery<GroupChatQuery, GroupChatQueryVariables>(
            {
              query: GroupChatDocument,
              variables: { name: groupName },
            },
            (groupChatData) => {
              if (!groupChatData) {
                return;
              }
              return produce(groupChatData, (draft) => {
                draft.group.chat.messages.push(message);
              });
            },
          );
        }
        if (vibeChat) {
          cache.updateQuery<VibeChatQuery>(
            {
              query: VibeChatDocument,
            },
            (vibeChatData) => {
              if (!vibeChatData) {
                return;
              }
              return produce(vibeChatData, (draft) => {
                draft.vibeChat.messages.push(message);
              });
            },
          );
        }
      },
      onError() {
        toastVar({
          status: 'error',
          title: t('chat.errors.couldNotSend'),
        });
      },
      onCompleted() {
        if (onSubmit) {
          onSubmit();
        }
        resetForm();
        setImages([]);
        setImagesInputKey(getRandomString());
      },
    });
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

  const handleFormHeightChange = () => {
    if (!formRef.current) {
      return;
    }
    const { clientHeight } = formRef.current;
    setFormHeight(clientHeight || 0);
  };

  const handleRemoveSelectedImage = (imageName: string) => {
    setImages(images.filter((image) => image.name !== imageName));
    setImagesInputKey(getRandomString());
  };

  const validate = ({ body }: SendMessageInput) => {
    const errors: FormikErrors<SendMessageInput> = {};
    if (body && body.length > 6000) {
      errors.body = t('chat.errors.longBody');
    }
    return errors;
  };

  return (
    <Container maxWidth="sm" sx={containerStyles}>
      <Box sx={formStyles} ref={formRef}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          validate={validate}
          enableReinitialize
        >
          {({ handleChange, values, submitForm, isSubmitting, errors }) => (
            <Box>
              <FormGroup row>
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
                    onKeyDown={(e) => handleFilledInputKeyDown(e, submitForm)}
                    onKeyUp={handleFormHeightChange}
                    placeholder={t('chat.prompts.sendAMessage')}
                    sx={inputStyles}
                    value={values.body || ''}
                    onChange={(e) => {
                      handleFormHeightChange();
                      handleChange(e);
                    }}
                    disableUnderline
                    multiline
                  />

                  {!!errors.body && (
                    <Typography color="error" fontSize="small">
                      {errors.body}
                    </Typography>
                  )}

                  <Flex justifyContent="space-between">
                    <ImageInput
                      setImages={setImages}
                      refreshKey={imagesInputKey}
                      iconStyles={{ color: 'text.secondary', fontSize: 25 }}
                      multiple
                    />

                    <IconButton
                      disabled={
                        isSubmitting || (!values.body && !images?.length)
                      }
                      sx={sendButtonStyles}
                      onClick={submitForm}
                      edge="end"
                      disableRipple
                    >
                      {loading ? (
                        <CircularProgress size={10} />
                      ) : (
                        <Send sx={{ fontSize: 20, color: 'text.secondary' }} />
                      )}
                    </IconButton>
                  </Flex>
                </Box>
              </FormGroup>

              <AttachedImagePreview
                handleRemove={handleRemoveSelectedImage}
                selectedImages={images}
                sx={{
                  marginTop: images.length ? 2.5 : 0,
                  marginLeft: 1.5,
                }}
              />
            </Box>
          )}
        </Formik>
        {isDesktop && <Box sx={hiderStyles} />}
      </Box>
    </Container>
  );
};

export default MessageForm;
