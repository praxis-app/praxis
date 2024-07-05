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
import { toastVar } from '../../graphql/cache';
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
import SharedProposal from '../Proposals/SharedProposal';
import CardFooterButton from '../Shared/CardFooterButton';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import Spinner from '../Shared/Spinner';
import UserAvatar from '../Users/UserAvatar';
import PostLikeButton from './PostLikeButton';
import SharePostModal from './SharePostModal';
import SharedPost from './SharedPost';

const ROTATED_ICON_STYLES: SxProps = {
  marginRight: '0.4ch',
  transform: 'rotateY(180deg)',
};

interface Props {
  post: PostShareCompactFragment;
  currentUserId?: number;
  canManagePosts?: boolean;
  isVerified: boolean;
  isLast: boolean;
}

const PostShareCompact = ({
  post,
  currentUserId,
  canManagePosts,
  isVerified,
  isLast,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [likesAnchorEl, setLikesAnchorEl] = useState<null | HTMLElement>(null);
  const [isLikesModalOpen, setIsLikesModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  const [getSharedContent, { data, loading, error, called }] =
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
  const sharedProposal = data?.post.sharedProposal;

  const isEventPage = pathname.includes(NavigationPaths.Events);
  const isGroupPage = pathname.includes(`${NavigationPaths.Groups}/`);
  const isPostPage = pathname.includes(NavigationPaths.Posts);

  const groupPath = getGroupPath(group?.name || '');
  const postPath = `${NavigationPaths.Posts}/${id}`;
  const userProfilePath = getUserProfilePath(user?.name);

  const handleShareBtnClick = async () => {
    if (!isVerified) {
      toastVar({
        title: t('posts.prompts.verifyToShare'),
        status: 'info',
      });
      return;
    }
    if (!called) {
      await getSharedContent({
        variables: { postId: id },
      });
    }
    setIsShareModalOpen(true);
  };

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
  ) => setLikesAnchorEl(event.currentTarget);

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

  const renderCardContent = () => {
    if (error) {
      return <Typography>{t('errors.somethingWentWrong')}</Typography>;
    }
    if (!data) {
      return (
        <Button
          sx={{ textTransform: 'none', paddingX: 2 }}
          onClick={() => getSharedContent({ variables: { postId: id } })}
          startIcon={loading && <Spinner size={13} sx={{ marginTop: -0.12 }} />}
          disabled={loading}
        >
          {t('posts.actions.showAttachment')}
        </Button>
      );
    }
    if (sharedProposal) {
      return (
        <SharedProposal proposal={sharedProposal} width="100%" isCompact />
      );
    }
    return <SharedPost post={sharedPost} width="100%" />;
  };

  return (
    <Box
      borderRadius="8px"
      border={`1px solid ${theme.palette.divider}`}
      marginBottom={isLast ? 0 : '12px'}
    >
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
          paddingTop: data ? undefined : 0,
          paddingBottom: data && likeCount ? undefined : 0,
        }}
      >
        {renderCardContent()}
      </CardContent>

      {!!likeCount && (
        <Box paddingX={2}>
          <Flex
            onMouseEnter={handlePopoverOpen}
            onMouseLeave={() => setLikesAnchorEl(null)}
            onClick={() => setIsLikesModalOpen(true)}
            paddingBottom={0.8}
            sx={{ cursor: 'pointer' }}
          >
            <LikeBadge
              postId={id}
              anchorEl={likesAnchorEl}
              handlePopoverClose={() => setLikesAnchorEl(null)}
              marginRight="11px"
            />

            <Typography sx={{ userSelect: 'none' }}>{likeCount}</Typography>
          </Flex>

          <LikesModal
            open={isLikesModalOpen}
            onClose={() => setIsLikesModalOpen(false)}
            postId={id}
          />

          <Divider />
        </Box>
      )}

      <CardActions sx={{ justifyContent: 'space-around' }}>
        <PostLikeButton postId={id} isLikedByMe={!!isLikedByMe} />

        <CardFooterButton onClick={handleShareBtnClick}>
          <Reply sx={ROTATED_ICON_STYLES} />
          {t('actions.share')}
        </CardFooterButton>
      </CardActions>

      {currentUserId && (
        <SharePostModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          sharedPostId={sharedPost?.id}
          sharedProposalId={sharedProposal?.id}
          sharedFromUserId={post.user.id}
          currentUserId={currentUserId}
        />
      )}
    </Box>
  );
};

export default PostShareCompact;
