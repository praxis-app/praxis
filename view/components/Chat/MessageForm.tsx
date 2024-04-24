import { Send } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  FormGroup,
  IconButton,
  Input,
  SxProps,
} from '@mui/material';
import { Formik } from 'formik';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FieldNames } from '../../constants/shared.constants';
import { getRandomString } from '../../utils/shared.utils';
import AttachedImagePreview from '../Images/AttachedImagePreview';
import ImageInput from '../Images/ImageInput';
import Flex from '../Shared/Flex';
import { useSendMessageMutation } from '../../graphql/chat/mutations/gen/SendMessage.gen';
import { SendMessageInput } from '../../graphql/gen';

interface Props {
  conversationId: number;
}

const MessageForm = ({ conversationId }: Props) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagesInputKey, setImagesInputKey] = useState('');
  const [sendMessage, { loading }] = useSendMessageMutation();
  const { t } = useTranslation();

  const initialValues = {
    [FieldNames.Body]: '',
    conversationId,
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

  const handleSubmit = async (values: SendMessageInput) =>
    await sendMessage({
      variables: {
        messageData: { ...values, images },
      },
    });

  const handleRemoveSelectedImage = (imageName: string) => {
    setImages(images.filter((image) => image.name !== imageName));
    setImagesInputKey(getRandomString());
  };

  return (
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
                  disabled={isSubmitting || (!values.body && !images?.length)}
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
            sx={{ marginLeft: 5.5 }}
          />
        </Box>
      )}
    </Formik>
  );
};

export default MessageForm;
