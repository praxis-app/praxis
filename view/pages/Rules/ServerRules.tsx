import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useServerRulesQuery } from '../../graphql/rules/queries/gen/ServerRules.gen';

const ServerRules = () => {
  const { data, loading } = useServerRulesQuery();

  const { t } = useTranslation();

  if (loading) {
    return <ProgressBar />;
  }

  return (
    <>
      <LevelOneHeading header>{t('rules.headers.serverRules')}</LevelOneHeading>

      {JSON.stringify(data)}
    </>
  );
};

export default ServerRules;
