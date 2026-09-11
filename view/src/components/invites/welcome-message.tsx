import {
  LocalStorageKeys,
  NavigationPaths,
} from '@/constants/shared.constants';
import { useAuthData } from '@/hooks/use-auth-data';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { BotMessage } from '../messages/bot-message';
import { Button } from '../ui/button';

interface Props {
  onDismiss: () => void;
}

export const WelcomeMessage = ({ onDismiss }: Props) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { signUpPath, showSignUp, isLoggedIn } = useAuthData();

  const handleDismiss = () => {
    localStorage.setItem(LocalStorageKeys.HideWelcomeMessage, 'true');
    onDismiss();
  };

  return (
    <BotMessage
      bodyClassName="pt-2.25"
      onDismiss={handleDismiss}
      currentUserOnly
    >
      <p className="pb-2 text-xl">{t('prompts.welcomeToPraxis')}</p>

      <p className="pb-2.5">{t('welcome.messages.projectDescription1')}</p>

      <p className="pb-2.5">{t('welcome.messages.projectDescription2')}</p>

      <p className="pb-3">{t('welcome.messages.inDev')}</p>

      {!isLoggedIn && (
        <Button
          onClick={() => navigate(NavigationPaths.Login)}
          className="mr-3 uppercase"
          variant="secondary"
        >
          {t('auth.actions.logIn')}
        </Button>
      )}

      {showSignUp && (
        <Button
          onClick={() => navigate(signUpPath)}
          className="uppercase"
          variant="secondary"
        >
          {t('auth.actions.signUp')}
        </Button>
      )}
    </BotMessage>
  );
};
