import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import QuestionnaireTicketCard from '../../components/Questions/QuestionnaireTicketCard';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useServerQuestionnairesQuery } from '../../graphql/questions/queries/gen/ServerQuestionnaires.gen';

const ServerQuestionnaires = () => {
  const { data, loading, error } = useServerQuestionnairesQuery();

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

  return (
    <>
      <LevelOneHeading header>
        {t('questions.labels.questionnaires')}
      </LevelOneHeading>

      {data.serverQuestionnaireTickets.map((questionnaire) => (
        <QuestionnaireTicketCard
          key={questionnaire.id}
          questionnaireTicket={questionnaire}
        />
      ))}
    </>
  );
};

export default ServerQuestionnaires;
