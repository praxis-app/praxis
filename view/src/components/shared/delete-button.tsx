import { cn } from '@/lib/shared.utils';
import { type ButtonHTMLAttributes } from 'react';
import { Button } from '../ui/button';

interface DeleteButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const DeleteButton = ({
  children,
  className,
  ...buttonProps
}: DeleteButtonProps) => (
  <Button
    variant="outline"
    className={cn(
      'border-destructive text-destructive hover:text-destructive-foreground w-full',
      className,
    )}
    {...buttonProps}
  >
    {children}
  </Button>
);
