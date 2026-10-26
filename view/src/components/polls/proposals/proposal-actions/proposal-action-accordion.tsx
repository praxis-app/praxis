import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { type ReactNode } from 'react';

interface Props {
  ariaLabel?: string;
  children: ReactNode;
  summary: ReactNode;
  value: string;
}

export const ProposalActionAccordion = ({
  ariaLabel,
  children,
  summary,
  value,
}: Props) => (
  <Accordion
    type="single"
    collapsible
    className="mb-2.5 max-w-full min-w-0 overflow-hidden rounded-lg bg-black/2 px-4 dark:bg-black/10"
  >
    <AccordionItem value={value} className="min-w-0">
      <AccordionTrigger
        aria-label={ariaLabel}
        className="w-full min-w-0 cursor-pointer justify-start gap-2 py-4 text-base hover:no-underline [&>svg]:order-first [&>svg]:size-5"
      >
        <div className="min-w-0 flex-1 truncate">{summary}</div>
      </AccordionTrigger>
      <AccordionContent className="grid gap-x-6 gap-y-4 px-2 pb-5 sm:grid-cols-2">
        {children}
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);
