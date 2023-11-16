import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

const PageNotFound = () => {
  const { t } = useTranslation();

  return <Typography>{t('errors.pageNotFound')}</Typography>;
};

export default PageNotFound;
