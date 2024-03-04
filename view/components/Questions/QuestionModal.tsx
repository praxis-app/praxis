import { Box, SxProps } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnswerQuestionsFormFieldFragment } from '../../graphql/questions/fragments/gen/AnswerQuestionsFormField.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import CommentForm from '../Comments/CommentForm';
import Modal from '../Shared/Modal';
import AnswerQuestionsFormField, {
  AnswerQuestionsFormFieldProps,
} from './AnswerQuestionsFormField';

interface Props {
  onClose(): void;
  open: boolean;
  question: AnswerQuestionsFormFieldFragment;
  formFieldProps: AnswerQuestionsFormFieldProps;
}

const QuestionModal = ({
  onClose,
  open,
  question: { id, commentCount, priority },
  formFieldProps,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [commentCount]);

  const contentStyles: SxProps = {
    width: isDesktop ? '700px' : '100%',
    paddingBottom: 0,
    minHeight: '50vh',
  };

  return (
    <Modal
      title={t('questions.headers.questionPriority', {
        priority: priority + 1,
      })}
      contentStyles={contentStyles}
      footerContent={
        <Box
          bgcolor="background.paper"
          bottom={0}
          left={0}
          paddingTop="12px"
          paddingX="16px"
          width="100%"
        >
          <CommentForm questionId={id} expanded />
        </Box>
      }
      maxWidth="md"
      onClose={onClose}
      open={open}
      centeredTitle
    >
      <AnswerQuestionsFormField {...formFieldProps} inModal />
      <Box ref={ref} />
    </Modal>
  );
};

export default QuestionModal;
