import {
  Box,
  Button,
  CardActions,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  SxProps,
  Typography,
  styled,
  useTheme,
} from '@mui/material';
import { truncate } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  MIDDOT_WITH_SPACES,
  NavigationPaths,
  TruncationSizes,
} from '../../constants/shared.constants';
import { PostShareCompactFragment } from '../../graphql/posts/fragments/gen/PostShareCompact.gen';
import { useDeletePostMutation } from '../../graphql/posts/mutations/gen/DeletePost.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { removePost } from '../../utils/cache.utils';
import { getGroupPath } from '../../utils/group.utils';
import { timeAgo } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import EventItemAvatar from '../Events/EventItemAvatar';
import GroupItemAvatar from '../Groups/GroupItemAvatar';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import PostLikeButton from './PostLikeButton';
import CardFooterButton from '../Shared/CardFooterButton';
import { Reply } from '@mui/icons-material';

const ROTATED_ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
  transform: 'rotateY(180deg)',
};

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
}));

const CardContent = styled(MuiCardContent)(() => ({
  '&:last-child': {
    paddingBottom: 16,
    paddingTop: 0,
  },
}));

interface Props {
  post: PostShareCompactFragment;
  currentUserId?: number;
  canManagePosts?: boolean;
}

const PostShareCompact = ({ post, currentUserId, canManagePosts }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [deletePost] = useDeletePostMutation();

  const { t } = useTranslation();
  const { pathname } = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const { id, createdAt, user, group, event, isLikedByMe } = post;
  const isMe = currentUserId === user.id;
  const formattedDate = timeAgo(createdAt);

  const isEventPage = pathname.includes(NavigationPaths.Events);
  const isGroupPage = pathname.includes(`${NavigationPaths.Groups}/`);
  const isPostPage = pathname.includes(NavigationPaths.Posts);

  const groupPath = getGroupPath(group?.name || '');
  const postPath = `${NavigationPaths.Posts}/${id}`;
  const userProfilePath = getUserProfilePath(user?.name);

  const handleDelete = async () => {
    if (isPostPage) {
      navigate(NavigationPaths.Home);
    }
    await deletePost({
      variables: { id },
      update: removePost(id),
    });
  };

  const renderAvatar = () => {
    if (group && !isGroupPage) {
      return <GroupItemAvatar user={user} group={group} />;
    }
    if (event && !isEventPage) {
      return <EventItemAvatar user={user} event={event} />;
    }
    return <UserAvatar user={user} withLink />;
  };

  const renderTitle = () => {
    const showGroup = group && !isGroupPage;
    const username = user.displayName || user.name;
    const truncatedUsername = truncate(username, {
      length: isDesktop ? TruncationSizes.Medium : 20,
    });

    return (
      <Box marginBottom={showGroup ? -0.5 : 0}>
        {showGroup && (
          <Link href={groupPath}>
            <Typography
              fontFamily="Inter Medium"
              color="primary"
              lineHeight={1}
              fontSize={15}
            >
              {group.name}
            </Typography>
          </Link>
        )}
        <Box fontSize={14} sx={{ color: 'text.secondary' }}>
          <Link
            href={userProfilePath}
            sx={{
              color: showGroup ? 'inherit' : undefined,
              fontFamily: showGroup ? undefined : 'Inter Medium',
            }}
          >
            {truncatedUsername}
          </Link>
          {MIDDOT_WITH_SPACES}
          <Link href={postPath} sx={{ color: 'inherit', fontSize: 13 }}>
            {formattedDate}
          </Link>
        </Box>
      </Box>
    );
  };

  const renderMenu = () => {
    const editPostPath = `${NavigationPaths.Posts}/${id}${NavigationPaths.Edit}`;
    const deletePostPrompt = t('prompts.deleteItem', { itemType: 'post' });

    const canDelete = canManagePosts || isMe;

    return (
      <ItemMenu
        anchorEl={menuAnchorEl}
        canDelete={canDelete}
        canUpdate={isMe}
        deleteItem={handleDelete}
        deletePrompt={deletePostPrompt}
        editPath={editPostPath}
        setAnchorEl={setMenuAnchorEl}
      />
    );
  };

  return (
    <Box borderRadius="8px" border={`1px solid ${theme.palette.divider}`}>
      <CardHeader
        action={renderMenu()}
        avatar={renderAvatar()}
        title={renderTitle()}
      />

      <CardContent sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button sx={{ textTransform: 'none', paddingX: 2 }}>
          {t('posts.actions.showAttachment')}
        </Button>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-around' }}>
        <PostLikeButton postId={id} isLikedByMe={!!isLikedByMe} />

        <CardFooterButton>
          <Reply sx={ROTATED_ICON_STYLES} />
          {t('actions.share')}
        </CardFooterButton>
      </CardActions>
    </Box>
  );
};

export default PostShareCompact;
