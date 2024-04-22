import { Typography } from '@mui/material';
import { useVibeChatQuery } from '../../graphql/chat/queries/gen/VibeChat.gen';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useTranslation } from 'react-i18next';

const VibeChat = () => {
  const { data, loading, error } = useVibeChatQuery();
  const { t } = useTranslation();

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  return <>{JSON.stringify(data)}</>;
};

export default VibeChat;
