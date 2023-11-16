import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import pageNotFoundGif from '../../assets/images/404.gif';
import Center from '../../components/Shared/Center';

const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <Center>
      <Box
        alt={t('errors.pageNotFound')}
        component="img"
        width="50%"
        height="50%"
        alignSelf="center"
        src={pageNotFoundGif}
        sx={{ objectFit: 'cover' }}
      />
    </Center>
  );
};

export default PageNotFound;
