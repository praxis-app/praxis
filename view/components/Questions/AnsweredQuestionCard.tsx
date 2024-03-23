import { Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { AnsweredQuestionCardFragment } from '../../graphql/questions/fragments/gen/AnsweredQuestionCard.gen';
import { urlifyText } from '../../utils/shared.utils';
import { formatDateTime } from '../../utils/time.utils';
import QuestionCardFooter from './QuestionCardFooter';

interface Props {
  question: AnsweredQuestionCardFragment;
  inModal?: boolean;
}

const AnsweredQuestionCard = ({ question, inModal }: Props) => {
  const { t } = useTranslation();

  const { text, priority, answer } = question;

  const questionText = `${t('questions.headers.questionPriority', {
    priority: priority + 1,
  })}: ${text}`;

  const getAnswerText = () => {
    if (!answer?.text) {
      return t('questions.labels.noAnswer');
    }
    return urlifyText(answer.text);
  };

  const getTitle = () => {
    if (!answer?.updatedAt || !answer.text) {
      return t('questions.labels.noAnswer');
    }
    return formatDateTime(answer.updatedAt);
  };

  const renderAnsweredQuestion = () => (
    <>
      <CardContent sx={{ paddingY: 1.8, paddingX: inModal ? 0 : undefined }}>
        <Typography color="text.secondary" paddingBottom={1.2}>
          {questionText}
        </Typography>

        <Typography
          title={getTitle()}
          dangerouslySetInnerHTML={{ __html: getAnswerText() }}
          whiteSpace="pre-wrap"
        />
      </CardContent>

      <QuestionCardFooter question={question} inModal={inModal} />
    </>
  );

  if (inModal) {
    return renderAnsweredQuestion();
  }

  return <Card>{renderAnsweredQuestion()}</Card>;
};

export default AnsweredQuestionCard;
