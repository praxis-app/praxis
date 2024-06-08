import { Assignment } from '@mui/icons-material';
import { Box, MenuItem, SxProps, TableRow } from '@mui/material';
import { truncate } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../graphql/cache';
import { ServerInviteCardFragment } from '../../graphql/invites/fragments/gen/ServerInviteCard.gen';
import { useDeleteServerInviteMutation } from '../../graphql/invites/mutations/gen/DeleteServerInvite.gen';
import { ServerInvitesQuery } from '../../graphql/invites/queries/gen/ServerInvites.gen';
import { removeServerInvite } from '../../utils/cache.utils';
import { copyInviteLink } from '../../utils/server-invite.utils';
import { timeFromNow } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import TableCell from '../Shared/TableCell';
import UserAvatar from '../Users/UserAvatar';

interface Props {
  me: ServerInvitesQuery['me'];
  serverInvite: ServerInviteCardFragment;
}

const ServerInviteRow = ({
  serverInvite: { id, user, token, uses, maxUses, expiresAt },
  me,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteInvite] = useDeleteServerInviteMutation();

  const { t } = useTranslation();

  const deleteInvitePrompt = t('prompts.deleteItem', {
    itemType: 'invite link',
  });

  const tableRowStyles: SxProps = {
    '&:last-child td, &:last-child th': {
      border: 0,
    },
  };

  const handleDelete = async () =>
    await deleteInvite({
      variables: { id },
      update: removeServerInvite(id),
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
      },
    });

  const handleCopyLink = async () => {
    await copyInviteLink(token);
    toastVar({
      title: t('invites.prompts.copiedToClipboard'),
      status: 'success',
    });
    setMenuAnchorEl(null);
  };

  if (!me) {
    return null;
  }

  const {
    serverPermissions: { manageInvites },
  } = me;

  const username = user.displayName || user.name;
  const truncatedUsername = truncate(username, { length: 18 });

  return (
    <TableRow sx={tableRowStyles}>
      <TableCell>
        <Link href={getUserProfilePath(user.name)} sx={{ display: 'flex' }}>
          <UserAvatar user={user} size={24} sx={{ marginRight: 1.5 }} />
          <Box marginTop={0.25}>{truncatedUsername}</Box>
        </Link>
      </TableCell>

      <TableCell onClick={handleCopyLink} sx={{ cursor: 'pointer' }}>
        {token}
      </TableCell>

      <TableCell>{uses + (maxUses ? `/${maxUses}` : '')}</TableCell>

      <TableCell>
        {expiresAt ? timeFromNow(expiresAt) : t('time.infinity')}
      </TableCell>

      <TableCell>
        <ItemMenu
          anchorEl={menuAnchorEl}
          canDelete={manageInvites}
          deleteItem={handleDelete}
          deletePrompt={deleteInvitePrompt}
          setAnchorEl={setMenuAnchorEl}
          prependChildren
        >
          <MenuItem onClick={handleCopyLink}>
            <Assignment fontSize="small" sx={{ marginRight: 1 }} />
            {t('actions.copy')}
          </MenuItem>
        </ItemMenu>
      </TableCell>
    </TableRow>
  );
};

export default ServerInviteRow;
