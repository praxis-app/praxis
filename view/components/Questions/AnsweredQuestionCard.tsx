import {
  Card,
  CardContent,
  CardHeader as MuiCardHeader,
  SxProps,
  Typography,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestionCard.gen';
import { MyAnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/MyAnsweredQuestionCard.gen';
import AnsweredQuestionCardFooter from './AnweredQuestionCardFooter';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingTop: '14px',
  paddingBottom: '0px',
}));

interface Props {
  question: AnsweredQuestionCardFragment | MyAnsweredQuestionCardFragment;
  inModal?: boolean;
}

const AnsweredQuestionCard = ({ question, inModal }: Props) => {
  const { t } = useTranslation();

  const { text, priority } = question;

  const questionText = `${t('questions.headers.questionPriority', {
    priority: priority + 1,
  })}: ${text}`;

  const cardContentStyles: SxProps = {
    paddingTop: 1.2,
    paddingBottom: 0.6,
    paddingX: inModal ? 0 : undefined,
  };

  const getAnswerText = () => {
    if ('myAnswer' in question) {
      return question.myAnswer?.text;
    }
    if ('answer' in question) {
      return question.answer?.text;
    }
  };

  const renderAnsweredQuestion = () => (
    <>
      <CardHeader
        title={<Typography color="text.secondary">{questionText}</Typography>}
        sx={{
          paddingX: inModal ? 0 : undefined,
          paddingTop: inModal ? 0 : undefined,
        }}
      />
      <CardContent sx={cardContentStyles}>
        <Typography>
          {getAnswerText() || t('questions.labels.noAnswer')}
        </Typography>
      </CardContent>

      <AnsweredQuestionCardFooter question={question} inModal={inModal} />
    </>
  );

  if (inModal) {
    return renderAnsweredQuestion();
  }

  return <Card>{renderAnsweredQuestion()}</Card>;
};

export default AnsweredQuestionCard;
