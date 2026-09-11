import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface Props {
  canSignUp: boolean;
  className?: string;
  isLoading?: boolean;
  label: string;
  showArrow?: boolean;
  signUpPath: string;
  size?: 'default' | 'lg';
}

export const LandingSignUpButton = ({
  canSignUp,
  className,
  isLoading = false,
  label,
  showArrow = false,
  signUpPath,
  size = 'default',
}: Props) => {
  const { t } = useTranslation();

  const content = (
    <>
      {label}
      {showArrow && <ArrowRight aria-hidden="true" />}
    </>
  );

  if (canSignUp) {
    return (
      <Button asChild size={size} className={className}>
        <Link to={signUpPath} state={{ fromLanding: true }}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button
      size={size}
      className={className}
      disabled={isLoading}
      onClick={() => toast(t('invites.prompts.inviteRequired'))}
    >
      {content}
    </Button>
  );
};
