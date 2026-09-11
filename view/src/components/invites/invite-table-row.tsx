import { NavigationPaths } from '@/constants/shared.constants';
import { useAbility } from '@/hooks/use-ability';
import { useDeleteInviteMutation } from '@/hooks/use-delete-invite-mutation';
import { copyInviteLink } from '@/lib/invite.utils';
import { truncate } from '@/lib/text.utils';
import { timeFromNow } from '@/lib/time.utils';
import { type InviteRes } from '@/types/invite.types';
import { useTranslation } from 'react-i18next';
import { MdAssignment } from 'react-icons/md';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { ItemMenu } from '../shared/item-menu';
import { DropdownMenuItem } from '../ui/dropdown-menu';
import { TableCell, TableRow } from '../ui/table';
import { UserAvatar } from '../users/user-avatar';

interface Props {
  invite: InviteRes;
}

export const InviteTableRow = ({
  invite: { id, user, token, uses, maxUses, expiresAt },
}: Props) => {
  const { t } = useTranslation();
  const { serverAbility } = useAbility();

  const { mutate: deleteInvite, isPending: isDeletePending } =
    useDeleteInviteMutation(id);

  const handleCopyLink = async () => {
    await copyInviteLink(token);
    toast(t('invites.prompts.copiedToClipboard'));
  };

  const name = user.displayName || user.name;
  const truncatedUsername = truncate(name, 18);

  const deleteInvitePrompt = t('prompts.deleteItem', {
    itemType: 'invite link',
  });

  return (
    <TableRow>
      <TableCell>
        <Link to={NavigationPaths.Root} className="flex items-center gap-3">
          <UserAvatar
            userId={user.id}
            name={user.name}
            imageId={user.profilePicture?.id}
            className="size-6"
            fallbackClassName="text-[0.7rem]"
          />
          <div>{truncatedUsername}</div>
        </Link>
      </TableCell>
      <TableCell className="cursor-pointer" onClick={handleCopyLink}>
        {token}
      </TableCell>
      <TableCell>{uses + (maxUses ? `/${maxUses}` : '')}</TableCell>
      <TableCell>
        {expiresAt ? timeFromNow(expiresAt) : t('time.infinity')}
      </TableCell>
      <TableCell>
        <ItemMenu
          canDelete={serverAbility.can('manage', 'Invite')}
          deletePrompt={deleteInvitePrompt}
          deleteItem={deleteInvite}
          loading={isDeletePending}
          prependChildren
        >
          <DropdownMenuItem onClick={handleCopyLink}>
            <MdAssignment className="mr-2" />
            {t('actions.copy')}
          </DropdownMenuItem>
        </ItemMenu>
      </TableCell>
    </TableRow>
  );
};
