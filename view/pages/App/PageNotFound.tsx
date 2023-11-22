import { useTranslation } from 'react-i18next';
import pageNotFoundGif from '../../assets/images/404.gif';
import LazyLoadImage from '../../components/Images/LazyLoadImage';
import Center from '../../components/Shared/Center';

const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <Center>
      <LazyLoadImage
        src={pageNotFoundGif}
        alt={t('errors.pageNotFound')}
        width="55%"
        display="block"
        margin="0 auto"
      />
    </Center>
  );
};

export default PageNotFound;
