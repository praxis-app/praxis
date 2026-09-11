// Ref: https://ui.shadcn.com/docs/components/sonner

import { useTheme } from 'next-themes';
import { useEffect } from 'react';
import { Toaster as Sonner, toast, type ToasterProps } from 'sonner';
import { cn } from '@/lib/shared.utils';

const Toaster = ({ className, ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        toast.dismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className={cn(
        'toaster group **:data-icon:mt-0.5! **:data-sonner-toast:items-start!',
        className,
      )}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
