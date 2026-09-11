import { useAbility } from '@/hooks/use-ability';
import { useDeleteInviteMutation } from '@/hooks/use-delete-invite-mutation';
import { copyInviteLink } from '@/lib/invite.utils';
import { truncate } from '@/lib/text.utils';
import { timeFromNow } from '@/lib/time.utils';
import { type InviteRes } from '@/types/invite.types';
import { useTranslation } from 'react-i18next';
import { MdAssignment } from 'react-icons/md';
import { toast } from 'sonner';
import { ItemMenu } from '../shared/item-menu';
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { UserAvatar } from '../users/user-avatar';

interface Props {
  invite: InviteRes;
}

export const InviteCard = ({
  invite: { id, token, uses, maxUses, expiresAt, user },
}: Props) => {
  const { t } = useTranslation();
  const { serverAbility } = useAbility();

  const { mutate: deleteInvite, isPending: isDeletePending } =
    useDeleteInviteMutation(id);

  const usesText = `${t('invites.labels.usesWithColon')} ${
    uses + (maxUses ? `/${maxUses}` : '')
  }`;
  const deleteInvitePrompt = t('prompts.deleteItem', {
    itemType: 'invite link',
  });

  const name = user.displayName || user.name;
  const truncatedUsername = truncate(name, 25);

  const handleCopyLink = async () => {
    await copyInviteLink(token);
    toast(t('invites.prompts.copiedToClipboard'));
  };

  return (
    <Card className="w-full max-w-md pt-2.5 pb-3.5">
      <CardHeader className="flex h-full items-center justify-between px-3 md:px-6">
        <CardTitle className="flex h-full items-center gap-2 font-normal">
          <div onClick={handleCopyLink} className="cursor-pointer">
            {token}
          </div>
          <div className="text-positive">
            {expiresAt ? timeFromNow(expiresAt) : t('time.never')}
          </div>
        </CardTitle>
        <CardAction>
          <ItemMenu
            canDelete={serverAbility.can('manage', 'Invite')}
            deletePrompt={deleteInvitePrompt}
            deleteItem={deleteInvite}
            loading={isDeletePending}
            variant="ghost"
            prependChildren
          >
            <DropdownMenuItem onClick={handleCopyLink}>
              <MdAssignment className="mr-2" />
              {t('actions.copy')}
            </DropdownMenuItem>
          </ItemMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-2 px-3 md:px-6">
        <div className="flex items-center gap-2">
          <UserAvatar
            name={user.name}
            userId={user.id}
            imageId={user.profilePicture?.id}
            className="size-7"
            fallbackClassName="text-[0.8rem]"
          />
          <div>{truncatedUsername}</div>
        </div>
        <div>{usesText}</div>
      </CardContent>
    </Card>
  );
};
