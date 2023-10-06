import { CircularProgress, CircularProgressProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Spinner = (props: CircularProgressProps) => {
  const { t } = useTranslation();

  return (
    <CircularProgress
      aria-label={t('states.loading')}
      role="progressbar"
      {...props}
    />
  );
};

export default Spinner;
