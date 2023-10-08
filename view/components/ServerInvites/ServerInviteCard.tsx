import { ApolloCache } from '@apollo/client';
import { Assignment } from '@mui/icons-material';
import {
  Box,
  Card,
  CardContent as MuiCardContent,
  CardHeader,
  Link,
  MenuItem,
  styled,
  Typography,
} from '@mui/material';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../apollo/cache';
import { useDeleteServerInviteMutation } from '../../apollo/invites/generated/DeleteServerInvite.mutation';
import { ServerInviteCardFragment } from '../../apollo/invites/generated/ServerInviteCard.fragment';
import {
  ServerInvitesDocument,
  ServerInvitesQuery,
} from '../../apollo/invites/generated/ServerInvites.query';
import { TypeNames } from '../../constants/shared.constants';
import { copyInviteLink } from '../../utils/server-invite.utils';
import { timeFromNow } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import CompactButton from '../Shared/CompactButton';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import UserAvatar from '../Users/UserAvatar';

export const removeServerInvite = (id: number) => (cache: ApolloCache<any>) => {
  cache.updateQuery<ServerInvitesQuery>(
    { query: ServerInvitesDocument },
    (invitesData) =>
      produce(invitesData, (draft) => {
        if (!draft) {
          return;
        }
        const index = draft.serverInvites.findIndex((p) => p.id === id);
        draft.serverInvites.splice(index, 1);
      }),
  );
  const cacheId = cache.identify({ id, __typename: TypeNames.ServerInvite });
  cache.evict({ id: cacheId });
  cache.gc();
};

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
          <Box>{user.name}</Box>
        </Link>

        <Typography>{usesText}</Typography>
      </CardContent>
    </Card>
  );
};

export default ServerInviteCard;
