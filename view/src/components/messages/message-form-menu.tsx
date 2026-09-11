import { CreatePollForm } from '@/components/polls/create-poll-form';
import { CreateProposalForm } from '@/components/polls/proposals/create-proposal-form/create-proposal-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { type ReactNode, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LuListTodo } from 'react-icons/lu';
import { MdPoll } from 'react-icons/md';

interface Props {
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  trigger: ReactNode;
  channelId?: string;
  callId?: string;
  disabled?: boolean;
}

export const MessageFormMenu = ({
  trigger,
  showMenu,
  setShowMenu,
  channelId,
  callId,
  disabled,
}: Props) => {
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [showPollForm, setShowPollForm] = useState(false);

  const proposalFormDialogContentRef = useRef<HTMLDivElement>(null);

  const { t } = useTranslation();

  const handleProposalFormNavigate = () => {
    if (proposalFormDialogContentRef.current) {
      proposalFormDialogContentRef.current.scrollTop = 0;
    }
  };

  return (
    <>
      <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
        <DropdownMenuTrigger
          aria-label={t('messages.actions.openMessageActions')}
          className="bg-input/30 hover:bg-input/40 inline-flex size-11 cursor-pointer items-center justify-center rounded-full p-2 px-3 focus:outline-none [&_svg]:shrink-0"
          disabled={disabled}
        >
          {trigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-52"
          align="start"
          alignOffset={-1}
          side="top"
          sideOffset={20}
        >
          <DropdownMenuItem
            className="text-md"
            onSelect={() => setShowProposalForm(true)}
          >
            <LuListTodo className="text-foreground size-5" />
            {t('proposals.actions.create')}
          </DropdownMenuItem>

          <DropdownMenuItem
            className="text-md"
            onSelect={() => setShowPollForm(true)}
          >
            <MdPoll className="text-foreground size-5" />
            {t('polls.actions.createPoll')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showProposalForm} onOpenChange={setShowProposalForm}>
        <DialogContent
          className="overflow-y-auto md:max-h-[90vh] md:w-xl"
          ref={proposalFormDialogContentRef}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl leading-tight font-medium">
              {t('proposals.headers.create')}
            </DialogTitle>
          </DialogHeader>
          <DialogDescription className="text-center md:text-left">
            {t('proposals.descriptions.create')}
          </DialogDescription>

          <Separator className="mt-1" />

          <CreateProposalForm
            channelId={channelId}
            callId={callId}
            onSuccess={() => setShowProposalForm(false)}
            onNavigate={handleProposalFormNavigate}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showPollForm} onOpenChange={setShowPollForm}>
        <DialogContent className="overflow-y-auto md:max-h-[90vh] md:w-xl">
          <DialogHeader className="pb-3.5">
            <DialogTitle>{t('polls.headers.create')}</DialogTitle>
          </DialogHeader>
          <VisuallyHidden>
            <DialogDescription className="text-center md:text-left">
              {t('polls.descriptions.create')}
            </DialogDescription>
          </VisuallyHidden>

          <CreatePollForm
            channelId={channelId}
            callId={callId}
            onSuccess={() => setShowPollForm(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
