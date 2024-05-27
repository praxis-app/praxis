import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';

const Chats = () => {
  const { t } = useTranslation();

  return (
    <>
      <LevelOneHeading header>{t('chat.headers.chats')}</LevelOneHeading>
    </>
  );
};

export default Chats;
