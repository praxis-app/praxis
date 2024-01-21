import { Box } from '@mui/material';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import { useTranslation } from 'react-i18next';

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
