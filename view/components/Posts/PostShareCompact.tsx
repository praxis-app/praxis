import { Reply } from '@mui/icons-material';
import {
  Box,
  Button,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  SxProps,
  Typography,
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
import { useSharedPostAttachmentLazyQuery } from '../../graphql/posts/queries/gen/SharedPostAttachment.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { removePost } from '../../utils/cache.utils';
import { getGroupPath } from '../../utils/group.utils';
import { timeAgo } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import EventItemAvatar from '../Events/EventItemAvatar';
import GroupItemAvatar from '../Groups/GroupItemAvatar';
import LikeBadge from '../Likes/LikeBadge';
import LikesModal from '../Likes/LikesModal';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import Spinner from '../Shared/Spinner';
import UserAvatar from '../Users/UserAvatar';
import PostLikeButton from './PostLikeButton';
import SharedPost from './SharedPost';

const ROTATED_ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
  transform: 'rotateY(180deg)',
};

interface Props {
  post: PostShareCompactFragment;
  currentUserId?: number;
  canManagePosts?: boolean;
}

const PostShareCompact = ({ post, currentUserId, canManagePosts }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [popoverAnchorEl, setPopoverAnchorEl] = useState<null | HTMLElement>(
    null,
  );
  const [showLikesModal, setShowLikesModal] = useState(false);

  const [getSharedPost, { data, loading, error }] =
    useSharedPostAttachmentLazyQuery();
  const [deletePost] = useDeletePostMutation();

  const { t } = useTranslation();
  const { pathname } = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const { id, createdAt, user, group, event, isLikedByMe, likeCount } = post;
  const isMe = currentUserId === user.id;
  const formattedDate = timeAgo(createdAt);
  const sharedPost = data?.post.sharedPost;

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

  const handlePopoverOpen = (
    event: React.MouseEvent<HTMLElement, MouseEvent>,
  ) => setPopoverAnchorEl(event.currentTarget);

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
        sx={{ paddingBottom: 0 }}
      />

      <CardContent
        sx={{
          display: 'flex',
          justifyContent: 'center',
          paddingY: data ? undefined : 0,
        }}
      >
        {data ? (
          <SharedPost post={sharedPost} width="100%" />
        ) : (
          <Button
            sx={{ textTransform: 'none', paddingX: 2 }}
            onClick={() => getSharedPost({ variables: { postId: id } })}
            startIcon={
              loading && <Spinner size={13} sx={{ marginTop: -0.12 }} />
            }
            disabled={loading}
          >
            {t('posts.actions.showAttachment')}
          </Button>
        )}
        {error && <Typography>{t('errors.somethingWentWrong')}</Typography>}
      </CardContent>

      {!!likeCount && (
        <Box paddingX={2}>
          <Flex
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={() => setPopoverAnchorEl(null)}
            onClick={() => setShowLikesModal(true)}
            paddingBottom={0.8}
            sx={{ cursor: 'pointer' }}
          >
            <LikeBadge
              postId={id}
              anchorEl={popoverAnchorEl}
              handlePopoverClose={() => setPopoverAnchorEl(null)}
              marginRight="11px"
            />

            <Typography sx={{ userSelect: 'none' }}>{likeCount}</Typography>
          </Flex>

          <LikesModal
            open={showLikesModal}
            onClose={() => setShowLikesModal(false)}
            postId={id}
          />

          <Divider />
        </Box>
      )}

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
