import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import { type IconType } from 'react-icons/lib';
import { MdMoreHoriz } from 'react-icons/md';
import { ModerationReasonDialog } from './moderation-reason-dialog';

export interface ModerationMenuAction<T extends string> {
  key: T;
  Icon: IconType;
  menuLabel: string;
  dialogTitle: string;
  confirmLabel: string;
  explanation: string[];
  isReasonRequired: boolean;
  isMenuItemDestructive?: boolean;
  isDialogDestructive?: boolean;
}

interface Props<T extends string> {
  targetName: string;
  triggerLabel: string;
  actions: ModerationMenuAction<T>[];
  isPending: boolean;
  onConfirm: (
    action: T,
    reason: string | undefined,
    onSuccess: () => void,
  ) => void;
}

export const ModerationActionMenu = <T extends string>({
  targetName,
  triggerLabel,
  actions,
  isPending,
  onConfirm,
}: Props<T>) => {
  const [pendingKey, setPendingKey] = useState<T | null>(null);

  const pendingAction = actions.find((action) => action.key === pendingKey);

  if (!actions.length) {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            aria-label={triggerLabel}
            className="size-9 p-0"
            variant="ghost"
            size="icon"
            disabled={isPending}
          >
            <MdMoreHoriz className="size-6" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {actions.map(({ key, Icon, menuLabel, isMenuItemDestructive }) => (
            <DropdownMenuItem
              key={key}
              variant={isMenuItemDestructive ? 'destructive' : 'default'}
              onSelect={() => setPendingKey(key)}
            >
              <Icon className="size-4" />
              {menuLabel}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ModerationReasonDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingKey(null)}
        title={pendingAction?.dialogTitle ?? ''}
        description={targetName}
        confirmLabel={pendingAction?.confirmLabel ?? ''}
        explanation={pendingAction?.explanation}
        isReasonRequired={pendingAction?.isReasonRequired}
        isDestructive={pendingAction?.isDialogDestructive}
        isPending={isPending}
        onConfirm={(reason) => {
          if (pendingAction) {
            onConfirm(pendingAction.key, reason, () => setPendingKey(null));
          }
        }}
      />
    </>
  );
};
