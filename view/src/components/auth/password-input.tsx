import { Input } from '@/components/ui/input';
import { cn } from '@/lib/shared.utils';
import { type ComponentProps, forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuEye, LuEyeOff } from 'react-icons/lu';

export const PasswordInput = forwardRef<
  HTMLInputElement,
  Omit<ComponentProps<'input'>, 'type'>
>(({ className, ...props }, ref) => {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation();

  const label = isVisible
    ? t('auth.actions.hidePassword')
    : t('auth.actions.showPassword');

  return (
    <div className="relative">
      <Input
        type={isVisible ? 'text' : 'password'}
        className={cn(
          'pr-10 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden',
          className,
        )}
        ref={ref}
        {...props}
      />
      <button
        type="button"
        className="text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring absolute top-1/2 right-1 flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={label}
        aria-pressed={isVisible}
        title={label}
        tabIndex={-1}
      >
        {isVisible ? (
          <LuEyeOff className="size-4" strokeWidth={2.25} aria-hidden="true" />
        ) : (
          <LuEye className="size-4" strokeWidth={2.25} aria-hidden="true" />
        )}
      </button>
    </div>
  );
});
PasswordInput.displayName = 'PasswordInput';
