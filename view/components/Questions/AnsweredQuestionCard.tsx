import { Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestionCard.gen';
import { MyAnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/MyAnsweredQuestionCard.gen';
import AnsweredQuestionCardFooter from './AnweredQuestionCardFooter';

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
      <CardContent
        sx={{
          paddingY: 1.8,
          paddingX: inModal ? 0 : undefined,
        }}
      >
        <Typography color="text.secondary" paddingBottom={1.2}>
          {questionText}
        </Typography>
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
