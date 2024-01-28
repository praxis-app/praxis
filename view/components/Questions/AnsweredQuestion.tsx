import {
  Card,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AnsweredQuestionFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestion.gen';

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
  question: AnsweredQuestionFragment;
}

const AnsweredQuestion = ({
  question: { text, priority, myAnswer },
}: Props) => {
  const { t } = useTranslation();

  const questionText = `${t('questions.headers.questionPriority', {
    priority: priority + 1,
  })}: ${text}`;

  return (
    <Card>
      <CardHeader
        title={<Typography color="text.secondary">{questionText}</Typography>}
      />
      <CardContent>
        <Typography>{myAnswer?.text}</Typography>
      </CardContent>
    </Card>
  );
};

export default AnsweredQuestion;
