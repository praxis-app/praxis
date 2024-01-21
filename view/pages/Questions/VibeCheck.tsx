import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';

const VibeCheck = () => {
  const { t } = useTranslation();

  return (
    <Box>
      <LevelOneHeading header>
        {t('questions.labels.vibeCheck')}
      </LevelOneHeading>
    </Box>
  );
};

export default VibeCheck;
