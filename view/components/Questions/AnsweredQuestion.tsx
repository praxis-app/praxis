import {
  Card,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AnsweredQuestionFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestion.gen';
import { MyAnsweredQuestionFragment } from '../../graphql/questions/fragments/gen/MyAnsweredQuestion.gen';
import AnsweredQuestionCardFooter from './AnweredQuestionCardFooter';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingTop: '11px',
  paddingBottom: '0px',
}));

const CardContent = styled(MuiCardContent)(() => ({
  paddingTop: '6px',
  '&:last-child': {
    paddingBottom: '14px',
  },
}));

interface Props {
  question: AnsweredQuestionFragment | MyAnsweredQuestionFragment;
}

const AnsweredQuestion = ({ question }: Props) => {
  const { t } = useTranslation();

  const { text, priority } = question;

  const questionText = `${t('questions.headers.questionPriority', {
    priority: priority + 1,
  })}: ${text}`;

  const getAnswerText = () => {
    if ('myAnswer' in question) {
      return question.myAnswer?.text;
    }
    if ('answer' in question) {
      return question.answer?.text;
    }
  };

  return (
    <Card>
      <CardHeader
        title={<Typography color="text.secondary">{questionText}</Typography>}
      />
      <CardContent>
        <Typography>{getAnswerText()}</Typography>
      </CardContent>

      <AnsweredQuestionCardFooter question={question} />
    </Card>
  );
};

export default AnsweredQuestion;
