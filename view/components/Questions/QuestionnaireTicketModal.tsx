import { Box, SxProps } from '@mui/material';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { QuestionnaireTicketCardFragment } from '../../graphql/questions/fragments/gen/QuestionnaireTicketCard.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import CommentForm from '../Comments/CommentForm';
import Modal from '../Shared/Modal';
import QuestionnaireTicketCard from './QuestionnaireTicketCard';

interface Props {
  questionnaireTicket: QuestionnaireTicketCardFragment;
  open: boolean;
  onClose(): void;
}

const QuestionnaireTicketModal = ({
  questionnaireTicket,
  open,
  onClose,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  useEffect(() => {
    ref.current?.scrollIntoView();
  }, [questionnaireTicket.commentCount]);

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
          <CommentForm
            questionnaireTicketId={questionnaireTicket.id}
            expanded
          />
        </Box>
      }
      title={t('questions.headers.questionnaireTicket')}
      maxWidth="md"
      onClose={onClose}
      open={open}
      centeredTitle
    >
      <QuestionnaireTicketCard
        questionnaireTicket={questionnaireTicket}
        inModal
      />
      <Box ref={ref} />
    </Modal>
  );
};

export default QuestionnaireTicketModal;
