import { LinearProgress, LinearProgressProps } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ProgressBar = (props: LinearProgressProps) => {
  const { t } = useTranslation();

  return (
    <LinearProgress
      aria-label={t('states.loading')}
      role="progressbar"
      {...props}
    />
  );
};

export default ProgressBar;
