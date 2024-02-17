import { useReactiveVar } from '@apollo/client';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import AnsweredQuestionCard from '../../components/Questions/AnsweredQuestionCard';
import QuestionnaireTicketCard from '../../components/Questions/QuestionnaireTicketCard';
import ProgressBar from '../../components/Shared/ProgressBar';
import { isLoggedInVar } from '../../graphql/cache';
import { useQuestionnairePageQuery } from '../../graphql/questions/queries/gen/QuestionnairePage.gen';

const QuestionnairePage = () => {
  const { id } = useParams();
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const { data, loading, error } = useQuestionnairePageQuery({
    variables: { questionnaireTicketId: parseInt(id || ''), isLoggedIn },
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
      <QuestionnaireTicketCard
        questionnaireTicket={questionnaireTicket}
        isTicketPage
      />

      {questions.map((question) => (
        <AnsweredQuestionCard key={question.id} question={question} />
      ))}
    </>
  );
};

export default QuestionnairePage;
