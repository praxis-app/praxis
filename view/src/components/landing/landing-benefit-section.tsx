import { cn } from '@/lib/shared.utils';
import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  visual: ReactNode;
  reversed?: boolean;
}

export const LandingBenefitSection = ({
  eyebrow,
  title,
  description,
  icon: Icon,
  visual,
  reversed = false,
}: Props) => (
  <section className="grid min-w-0 items-center gap-8 py-10 first:pt-0 last:pb-0 sm:gap-12 sm:py-24 lg:grid-cols-2 lg:gap-24">
    <div className={cn('max-w-xl min-w-0', reversed && 'lg:order-2')}>
      <div className="bg-praxis-coral-soft text-praxis-coral dark:bg-praxis-coral/15 mb-5 flex size-11 items-center justify-center rounded-2xl">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <p className="text-praxis-coral text-sm font-semibold tracking-[0.14em] uppercase">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-5xl">
        {title}
      </h2>
      <p className="text-muted-foreground mt-6 text-lg leading-8 text-pretty">
        {description}
      </p>
    </div>
    <div className={cn('max-w-full min-w-0', reversed && 'lg:order-1')}>
      {visual}
    </div>
  </section>
);
