import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import AnsweredQuestionCard from '../../components/Questions/AnsweredQuestionCard';
import QuestionnaireTicketCard from '../../components/Questions/QuestionnaireTicketCard';
import Breadcrumbs from '../../components/Shared/Breadcrumbs';
import ProgressBar from '../../components/Shared/ProgressBar';
import { NavigationPaths } from '../../constants/shared.constants';
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

  const breadcrumbs = [
    {
      label: t('questions.labels.questionnaires'),
      href: NavigationPaths.ServerQuestionnaires,
    },
    {
      label: t('questions.labels.ticketNumber', {
        number: questionnaireTicket.id,
      }),
    },
  ];

  return (
    <>
      <Breadcrumbs breadcrumbs={breadcrumbs} />

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
