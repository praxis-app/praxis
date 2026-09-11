import { UserAvatar } from '@/components/users/user-avatar';
import { type UserRes } from '@/types/user.types';
import { type ReactNode } from 'react';
import { LuMinus, LuPlus } from 'react-icons/lu';

interface ChangeValueProps {
  changeType: 'add' | 'remove';
  children: ReactNode;
}

export const ProposalActionChangeValue = ({
  changeType,
  children,
}: ChangeValueProps) => {
  const isAdd = changeType === 'add';
  const Icon = isAdd ? LuPlus : LuMinus;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border px-1.5 py-1.5">
      <span
        className={
          isAdd
            ? 'flex size-4.5 shrink-0 items-center justify-center rounded-lg bg-[#dcfce7] text-[#15803d] dark:bg-[#2e4532] dark:text-[#0cff4f]'
            : 'flex size-4.5 shrink-0 items-center justify-center rounded-lg bg-[#fee2e2] text-[#b91c1c] dark:bg-[#432d2b] dark:text-[#ff2727]'
        }
      >
        <Icon className="size-3.5" aria-hidden="true" />
      </span>
      <div className="min-w-0 truncate">{children}</div>
    </div>
  );
};

interface Props {
  label: string;
  oldValue: ReactNode;
  proposedValue: ReactNode;
}

export const ProposalActionChange = ({
  label,
  oldValue,
  proposedValue,
}: Props) => (
  <div className="min-w-0 space-y-2">
    <div className="font-medium">{label}</div>
    <ProposalActionChangeValue changeType="remove">
      {oldValue}
    </ProposalActionChangeValue>
    <ProposalActionChangeValue changeType="add">
      {proposedValue}
    </ProposalActionChangeValue>
  </div>
);

export const ProposalActionColorValue = ({ color }: { color?: string }) => (
  <span className="flex items-center gap-2">
    <span
      className="inline-block size-3.5 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
    />
    {color}
  </span>
);

export const ProposalActionMemberValue = ({ user }: { user: UserRes }) => {
  const name = user.displayName || user.name;
  return (
    <span className="flex items-center gap-2">
      <UserAvatar
        userId={user.id}
        name={name}
        imageId={user.profilePicture?.id}
        fallbackClassName="text-sm"
        className="size-5"
      />
      <span className="truncate">{name}</span>
    </span>
  );
};
