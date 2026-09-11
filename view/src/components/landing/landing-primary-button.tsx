import { LandingSignUpButton } from '@/components/landing/landing-sign-up-button';
import { Button } from '@/components/ui/button';
import { NavigationPaths } from '@/constants/shared.constants';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface Props {
  canSignUp: boolean;
  className?: string;
  isLoading?: boolean;
  isRegistered: boolean;
  label: string;
  showArrow?: boolean;
  signUpPath: string;
  size?: 'default' | 'lg';
}

export const LandingPrimaryButton = ({
  canSignUp,
  className,
  isLoading = false,
  isRegistered,
  label,
  showArrow = false,
  signUpPath,
  size = 'default',
}: Props) => {
  const { t } = useTranslation();

  if (isRegistered) {
    return (
      <Button asChild size={size} className={className}>
        <Link to={NavigationPaths.Root}>
          {t('landing.actions.openPraxis')}
          {showArrow && <ArrowRight aria-hidden="true" />}
        </Link>
      </Button>
    );
  }

  return (
    <LandingSignUpButton
      canSignUp={canSignUp}
      className={className}
      isLoading={isLoading}
      label={label}
      showArrow={showArrow}
      signUpPath={signUpPath}
      size={size}
    />
  );
};
