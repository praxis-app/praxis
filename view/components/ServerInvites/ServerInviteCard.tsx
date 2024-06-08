import { Assignment } from '@mui/icons-material';
import {
  Box,
  Card,
  CardHeader,
  Link,
  MenuItem,
  CardContent as MuiCardContent,
  Typography,
  styled,
} from '@mui/material';
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
import CompactButton from '../Shared/CompactButton';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import UserAvatar from '../Users/UserAvatar';

const CardContent = styled(MuiCardContent)(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  '&:last-child': {
    paddingBottom: 16,
    paddingTop: 4,
  },
}));

interface Props {
  me: ServerInvitesQuery['me'];
  serverInvite: ServerInviteCardFragment;
}

const ServerInviteCard = ({
  serverInvite: { id, user, token, uses, maxUses, expiresAt },
  me,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteInvite] = useDeleteServerInviteMutation();

  const { t } = useTranslation();

  const username = user.displayName || user.name;
  const truncatedUsername = truncate(username, { length: 25 });

  const usesText = `${t('invites.labels.usesWithColon')} ${
    uses + (maxUses ? `/${maxUses}` : '')
  }`;
  const deleteInvitePrompt = t('prompts.deleteItem', {
    itemType: 'invite link',
  });
  const canManageInvites = me?.serverPermissions.manageInvites;

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

  return (
    <Card>
      <CardHeader
        title={
          <Flex>
            <CompactButton
              onClick={handleCopyLink}
              sx={{
                textTransform: 'none',
                fontSize: '1rem',
                lineHeight: 1.5,
                marginRight: 1,
              }}
            >
              {token}
            </CompactButton>

            <Typography sx={{ color: '#62c57a' }}>
              {expiresAt ? timeFromNow(expiresAt) : t('time.never')}
            </Typography>
          </Flex>
        }
        action={
          <ItemMenu
            anchorEl={menuAnchorEl}
            canDelete={canManageInvites}
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
        }
      />
      <CardContent>
        <Link
          href={getUserProfilePath(user.name)}
          sx={{ display: 'flex', textDecoration: 'none' }}
        >
          <UserAvatar
            user={user}
            size={24}
            sx={{ marginRight: 1.5, marginBottom: 0.25 }}
          />
          <Box>{truncatedUsername}</Box>
        </Link>

        <Typography>{usesText}</Typography>
      </CardContent>
    </Card>
  );
};

export default ServerInviteCard;
