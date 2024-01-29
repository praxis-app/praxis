import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import AnsweredQuestion from '../../components/Questions/AnsweredQuestion';
import QuestionnaireTicketCard from '../../components/Questions/QuestionnaireTicketCard';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useQuestionnairePageQuery } from '../../graphql/questions/queries/gen/QuestionnairePage.gen';

const QuestionnairePage = () => {
  const { id } = useParams();
  const { data, loading, error } = useQuestionnairePageQuery({
    variables: { questionnaireTicketId: parseInt(id || '') },
    skip: !id,
  });

  const { t } = useTranslation();

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  const { questionnaireTicket } = data;
  const { questions } = questionnaireTicket;

  return (
    <>
      <QuestionnaireTicketCard questionnaireTicket={questionnaireTicket} />

      {questions.map((question) => (
        <AnsweredQuestion key={question.id} question={question} />
      ))}
    </>
  );
};

export default QuestionnairePage;
