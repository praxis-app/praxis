import { Box, SxProps } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestionCard.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import CommentForm from '../Comments/CommentForm';
import Modal from '../Shared/Modal';
import AnsweredQuestionCard from './AnsweredQuestionCard';

interface Props {
  question: AnsweredQuestionCardFragment;
  open: boolean;
  onClose(): void;
}

const AnsweredQuestionModal = ({ question, open, onClose }: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [question?.commentCount]);

  const { answer } = question;
  const userName = answer?.user.name;

  const title = userName
    ? t('questions.headers.usersAnswer', {
        name: userName[0].toUpperCase() + userName.slice(1),
      })
    : undefined;

  const contentStyles: SxProps = {
    width: isDesktop ? '700px' : '100%',
    paddingBottom: 0,
    minHeight: '50vh',
  };

  return (
    <Modal
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
          <CommentForm questionnaireTicketQuestionId={question.id} expanded />
        </Box>
      }
      maxWidth="md"
      onClose={onClose}
      open={open}
      title={title}
      centeredTitle
    >
      <AnsweredQuestionCard question={question} inModal />
      <Box ref={ref} />
    </Modal>
  );
};

export default AnsweredQuestionModal;
