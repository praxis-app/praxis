import { useTranslation } from 'react-i18next';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import pageNotFoundGif from '../../assets/images/404.gif';
import Center from '../../components/Shared/Center';

const PageNotFound = () => {
  const { t } = useTranslation();

  return (
    <Center>
      <LazyLoadImage
        src={pageNotFoundGif}
        alt={t('errors.pageNotFound')}
        effect="blur"
        style={{
          display: 'block',
          margin: '0 auto',
          width: '65%',
        }}
      />
    </Center>
  );
};

export default PageNotFound;
