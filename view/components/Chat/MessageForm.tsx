import { Send } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  Container,
  FormGroup,
  IconButton,
  Input,
  SxProps,
  useTheme,
} from '@mui/material';
import { Formik, FormikHelpers } from 'formik';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldNames, KeyCodes } from '../../constants/shared.constants';
import { useSendMessageMutation } from '../../graphql/chat/mutations/gen/SendMessage.gen';
import {
  VibeChatDocument,
  VibeChatQuery,
} from '../../graphql/chat/queries/gen/VibeChat.gen';
import { SendMessageInput } from '../../graphql/gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getRandomString } from '../../utils/shared.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import Flex from '../Shared/Flex';

interface Props {
  conversationId: number;
  vibeChat?: boolean;
  onSubmit?(): void;
}

const MessageForm = ({ conversationId, vibeChat, onSubmit }: Props) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagesInputKey, setImagesInputKey] = useState('');
  const [sendMessage, { loading }] = useSendMessageMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();
  const theme = useTheme();

  const initialValues = {
    [FieldNames.Body]: '',
    conversationId,
  };

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
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    marginX: 3,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '90px',
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
  ) =>
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
      onCompleted() {
        if (onSubmit) {
          onSubmit();
        }
        resetForm();
        setImages([]);
        setImagesInputKey(getRandomString());
      },
    });

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

  const handleRemoveSelectedImage = (imageName: string) => {
    setImages(images.filter((image) => image.name !== imageName));
    setImagesInputKey(getRandomString());
  };

  return (
    <Container maxWidth="sm" sx={containerStyles}>
      <Box sx={formStyles}>
        <Formik
          initialValues={initialValues}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ handleChange, values, submitForm, isSubmitting }) => (
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
                    onChange={handleChange}
                    onKeyDown={(e) => handleFilledInputKeyDown(e, submitForm)}
                    placeholder={t('chat.prompts.sendAMessage')}
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
