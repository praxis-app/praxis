import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useViewServerRolesQuery } from '../../graphql/roles/queries/gen/ViewServerRoles.gen';

const ViewServerRoles = () => {
  const { data, loading, error } = useViewServerRolesQuery();

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

  return <>{JSON.stringify(data)}</>;
};

export default ViewServerRoles;
