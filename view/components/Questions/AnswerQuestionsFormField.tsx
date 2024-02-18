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
import { toastVar } from '../../graphql/cache';
import { AnswerInput } from '../../graphql/gen';
import { AnswerQuestionsFormFieldFragment } from '../../graphql/questions/fragments/gen/AnswerQuestionsFormField.gen';
import { useAnswerQuestionsMutation } from '../../graphql/questions/mutations/gen/AnswerQuestions.gen';
import QuestionCardFooter from './QuestionCardFooter';

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

export interface AnswerQuestionsFormFieldProps {
  answers: AnswerInput[];
  dirty: boolean;
  error?: string;
  question: AnswerQuestionsFormFieldFragment;
  questionnaireTicketId: number;
  setFieldValue(name: string, value: AnswerInput[]): void;
  setIsSavingProgress(isSavingProgress: boolean): void;
  inModal?: boolean;
}

const AnswerQuestionsFormField = ({
  answers,
  dirty,
  error,
  question,
  questionnaireTicketId,
  setFieldValue,
  setIsSavingProgress,
  inModal,
}: AnswerQuestionsFormFieldProps) => {
  const [answerQuestions] = useAnswerQuestionsMutation();
  const { t } = useTranslation();

  const answer = answers.find((answer) => answer.questionId === question.id);

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
      if (answer.questionId !== question.id) {
        return answer;
      }
      return { ...answer, text: target.value };
    });
    setFieldValue(ANSWERS_FIELD_NAME, newAnswers);
  };

  const renderFormField = () => (
    <>
      <CardHeader
        title={
          <Typography fontFamily="Inter Medium" fontSize="16px">
            {question.text}
          </Typography>
        }
        sx={{
          paddingX: inModal ? 0 : undefined,
          paddingTop: inModal ? 0 : undefined,
        }}
      />

      <CardContent
        sx={{ paddingX: inModal ? 0 : undefined, marginBottom: 0.4 }}
      >
        <TextField
          autoComplete="off"
          defaultValue={answer?.text}
          error={!!error}
          label={t('questions.placeholders.writeAnswer')}
          onBlur={handleSaveProgress}
          onChange={handleTextFieldChange}
          sx={{ width: '100%', borderRadius: 8 }}
          InputProps={{ disableUnderline: true, sx: { borderRadius: '4px' } }}
          variant="filled"
          multiline
        />

        {error && (
          <Typography color="error" fontSize={12} paddingTop={0.5}>
            {error}
          </Typography>
        )}
      </CardContent>

      <QuestionCardFooter
        question={question}
        inModal={inModal}
        answerQuestionsFormFieldProps={{
          answers,
          dirty,
          error,
          inModal,
          question,
          questionnaireTicketId,
          setFieldValue,
          setIsSavingProgress,
        }}
      />
    </>
  );

  if (inModal) {
    return renderFormField();
  }

  return <Card>{renderFormField()}</Card>;
};

export default AnswerQuestionsFormField;
