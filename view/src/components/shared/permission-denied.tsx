import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box } from '../ui/box';
import { TopNav } from '../nav/top-nav';
import { cn } from '@/lib/shared.utils';

interface Props {
  topNavProps?: Record<string, unknown>;
  message?: ReactNode;
  className?: string;
}

export const PermissionDenied = ({
  message,
  topNavProps,
  className,
}: Props) => {
  const { t } = useTranslation();

  return (
    <Box
      className={cn(
        'fixed top-0 left-0 flex h-screen w-screen flex-col gap-10 text-center',
        className,
      )}
    >
      <TopNav {...topNavProps} />
      <p className="text-foreground">{message || t('prompts.accessDenied')}</p>
    </Box>
  );
};
