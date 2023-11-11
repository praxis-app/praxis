import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ServerSettingsForm from '../../components/Settings/ServerSettingsForm';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useServerSettingsQuery } from '../../graphql/settings/queries/gen/ServerSettings.gen';
import { isDeniedAccess } from '../../utils/error.utils';

const ServerSettings = () => {
  const { data, loading, error } = useServerSettingsQuery();

  const { t } = useTranslation();

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

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
      <LevelOneHeading header>{t('navigation.serverSettings')}</LevelOneHeading>
      <ServerSettingsForm
        serverSettings={data.serverConfig}
        canaryStatement={data.canary.statement}
      />
    </>
  );
};

export default ServerSettings;
