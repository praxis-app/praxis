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
import { AnswerInput } from '../../graphql/gen';
import { AnswerQuestionsFormFieldFragment } from '../../graphql/questions/fragments/gen/AnswerQuestionsFormField.gen';

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
  question: AnswerQuestionsFormFieldFragment;
  setFieldValue(name: string, value: AnswerInput[]): void;
  answers: AnswerInput[];
  onBlur(): void;
}

const AnswerQuestionsFormField = ({
  question: { id, text },
  setFieldValue,
  answers,
  onBlur,
}: Props) => {
  const { t } = useTranslation();

  const answer = answers.find((answer) => answer.questionId === id);

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
          label={t('questions.placeholders.writeAnswer')}
          defaultValue={answer?.text}
          onChange={handleTextFieldChange}
          sx={{ width: '100%' }}
          variant="outlined"
          onBlur={onBlur}
          multiline
        />
      </CardContent>
    </Card>
  );
};

export default AnswerQuestionsFormField;
