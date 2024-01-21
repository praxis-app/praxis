import {
  Button,
  Card,
  CardActions,
  IconButton,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../graphql/cache';
import { QuestionFragment } from '../../graphql/questions/fragments/gen/Question.gen';
import { useDeleteQuestionMutation } from '../../graphql/questions/mutations/gen/DeleteQuestion.gen';
import {
  ServerQuestionsDocument,
  ServerQuestionsQuery,
} from '../../graphql/questions/queries/gen/ServerQuestions.gen';
import { DarkMode } from '../../styles/theme';
import QuestionFormModal from './QuestionFormModal';
import { DragIndicator } from '@mui/icons-material';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingTop: '14px',
  paddingBottom: '18px',
}));

const CardContent = styled(MuiCardContent)(() => ({
  paddingTop: '11px',
  paddingBottom: '50px',
}));

interface Props {
  question: QuestionFragment;
  isDragging: boolean;
}

const Question = ({ question, isDragging }: Props) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteQuestion] = useDeleteQuestionMutation();
  const { t } = useTranslation();

  const { id, text, priority } = question;

  const handleDelete = async () => {
    await deleteQuestion({
      variables: { id },
      update(cache) {
        cache.updateQuery<ServerQuestionsQuery>(
          {
            query: ServerQuestionsDocument,
          },
          (questionsData) => {
            if (!questionsData) {
              return;
            }
            const newQuestions = questionsData.serverQuestions.map((q) => {
              if (priority > q.priority) {
                return q;
              }
              return { ...q, priority: q.priority - 1 };
            });
            return produce(questionsData, (draft) => {
              draft.serverQuestions = newQuestions;
            });
          },
        );
        const cacheId = cache.identify(question);
        cache.evict({ id: cacheId });
        cache.gc();
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });
  };

  const handleDeleteWithConfirm = () =>
    window.confirm(t('prompts.deleteItem', { itemType: 'question' })) &&
    handleDelete();

  return (
    <Card sx={{ opacity: isDragging ? 0.6 : 1, cursor: 'grab' }}>
      <CardHeader
        title={
          <>
            <Typography color="text.secondary" fontSize="15px">
              {t('questions.headers.questionPriority', {
                priority: priority + 1,
              })}
            </Typography>

            <Typography fontFamily="Inter Bold" fontSize="18px">
              {text}
            </Typography>
          </>
        }
        action={
          <IconButton
            sx={{ color: 'text.secondary', cursor: 'grab' }}
            disableRipple
          >
            <DragIndicator />
          </IconButton>
        }
      />

      <CardContent
        sx={{
          backgroundColor: 'background.secondary',
          marginX: 2,
          borderRadius: '8px',
        }}
      >
        <Typography color="text.secondary" fontSize="15px">
          {t('questions.placeholders.writeAnswer')}
        </Typography>
      </CardContent>

      <CardActions sx={{ margin: 1 }}>
        <Button
          onClick={() => setIsModalOpen(true)}
          sx={{
            textTransform: 'none',
            backgroundColor: '#2F3C5E',
            borderRadius: '6px',
            color: '#C7CDEE',
            flex: 1,

            '&:hover': {
              backgroundColor: '#394666',
            },
          }}
        >
          {t('actions.edit')}
        </Button>
        <Button
          onClick={handleDeleteWithConfirm}
          sx={{
            textTransform: 'none',
            backgroundColor: '#353536',
            borderRadius: '6px',
            flex: 1,

            '&:hover': {
              backgroundColor: DarkMode.DeadPixel,
            },
          }}
        >
          {t('actions.delete')}
        </Button>
      </CardActions>

      <QuestionFormModal
        isOpen={isModalOpen}
        editQuestion={question}
        onClose={() => setIsModalOpen(false)}
        onSubmit={() => setIsModalOpen(false)}
      />
    </Card>
  );
};

export default Question;
