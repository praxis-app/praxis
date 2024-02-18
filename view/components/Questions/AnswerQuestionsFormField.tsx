import { useReactiveVar } from '@apollo/client';
import {
  Card,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  TextField,
  Typography,
  styled,
} from '@mui/material';
import { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, toastVar } from '../../graphql/cache';
import { AnswerInput } from '../../graphql/gen';
import { AnswerQuestionsFormFieldFragment } from '../../graphql/questions/fragments/gen/AnswerQuestionsFormField.gen';
import { useAnswerQuestionsMutation } from '../../graphql/questions/mutations/gen/AnswerQuestions.gen';

const ANSWERS_FIELD_NAME = 'answers';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingTop: '11px',
  paddingBottom: '0px',
}));

const CardContent = styled(MuiCardContent)(() => ({
  paddingTop: '14px',
  '&:last-child': {
    paddingBottom: '14px',
  },
}));

interface Props {
  answers: AnswerInput[];
  dirty: boolean;
  error?: string;
  question: AnswerQuestionsFormFieldFragment;
  questionnaireTicketId: number;
  setFieldValue(name: string, value: AnswerInput[]): void;
  setIsSavingProgress(isSavingProgress: boolean): void;
}

const AnswerQuestionsFormField = ({
  answers,
  dirty,
  error,
  question: { id, text },
  questionnaireTicketId,
  setFieldValue,
  setIsSavingProgress,
}: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [answerQuestions] = useAnswerQuestionsMutation();
  const { t } = useTranslation();

  const answer = answers.find((answer) => answer.questionId === id);

  const handleSaveProgress = async () => {
    if (!dirty) {
      return;
    }
    setIsSavingProgress(true);
    await answerQuestions({
      variables: {
        answersData: {
          questionnaireTicketId,
          isSubmitting: false,
          answers,
        },
        isLoggedIn,
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });
    setIsSavingProgress(false);
  };

  const handleTextFieldChange = ({ target }: ChangeEvent<HTMLInputElement>) => {
    const newAnswers = answers.map((answer) => {
      if (answer.questionId !== id) {
        return answer;
      }
      return { ...answer, text: target.value };
    });
    setFieldValue(ANSWERS_FIELD_NAME, newAnswers);
  };

  return (
    <Card>
      <CardHeader
        title={
          <Typography fontFamily="Inter Medium" fontSize="16px">
            {text}
          </Typography>
        }
      />

      <CardContent>
        <TextField
          autoComplete="off"
          defaultValue={answer?.text}
          error={!!error}
          label={t('questions.placeholders.writeAnswer')}
          onBlur={handleSaveProgress}
          onChange={handleTextFieldChange}
          sx={{ width: '100%' }}
          variant="outlined"
          multiline
        />

        {error && (
          <Typography color="error" fontSize={12} paddingTop={0.5}>
            {error}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default AnswerQuestionsFormField;
