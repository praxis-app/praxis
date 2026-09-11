import { cn } from '@/lib/shared.utils';
import { type ReactNode } from 'react';

const MAX_WIDTH_CLASSES = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};
interface Props {
  children: ReactNode;
  className?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | false;
  disableGutters?: boolean;
  fixed?: boolean;
}

export const Container = ({
  children,
  className,
  maxWidth = '2xl',
  disableGutters = false,
  fixed = false,
}: Props) => {
  const maxWidthClass = maxWidth ? MAX_WIDTH_CLASSES[maxWidth] : '';
  const gutterClasses = disableGutters ? '' : 'px-4 sm:px-6 lg:px-8';

  return (
    <div
      className={cn(
        'pb-12',
        fixed ? 'w-full' : 'mx-auto w-full',
        'pt-5 md:pt-12',
        maxWidthClass,
        gutterClasses,
        className,
      )}
    >
      {children}
    </div>
  );
};
