import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import QuestionnaireTicketEntry from '../../components/Questions/QuestionnaireTicketEntry';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useServerQuestionnairesQuery } from '../../graphql/questions/queries/gen/ServerQuestionnaires.gen';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';

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
        <QuestionnaireTicketEntry
          key={questionnaire.id}
          questionnaireTicket={questionnaire}
        />
      ))}
    </>
  );
};

export default ServerQuestionnaires;
