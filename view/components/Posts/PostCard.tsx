import { useReactiveVar } from '@apollo/client';
import {
  Box,
  Card,
  CardProps,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  SxProps,
  Typography,
  styled,
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
import { isLoggedInVar } from '../../graphql/cache';
import { PostCardFragment } from '../../graphql/posts/fragments/gen/PostCard.gen';
import { useDeletePostMutation } from '../../graphql/posts/mutations/gen/DeletePost.gen';
import { useMeQuery } from '../../graphql/users/queries/gen/Me.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { removePost } from '../../utils/cache.utils';
import { getGroupPath } from '../../utils/group.utils';
import { timeAgo } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import EventItemAvatar from '../Events/EventItemAvatar';
import GroupItemAvatar from '../Groups/GroupItemAvatar';
import AttachedImageList from '../Images/AttachedImageList';
import FormattedText from '../Shared/FormattedText';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import PostCardFooter from './PostCardFooter';
import SharedPost from './SharedPost';
import SharedProposal from '../Proposals/SharedProposal';

const CardHeader = styled(MuiCardHeader)(() => ({
  paddingBottom: 0,
  '& .MuiCardHeader-avatar': {
    marginRight: 11,
  },
  '& .MuiCardHeader-title': {
    fontSize: 15,
  },
}));

const CardContent = styled(MuiCardContent)(() => ({
  paddingBottom: 0,
  '&:last-child': {
    paddingBottom: 0,
  },
}));

interface Props extends CardProps {
  post: PostCardFragment;
  inModal?: boolean;
}

const PostCard = ({ post, inModal = false, ...cardProps }: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [deletePost] = useDeletePostMutation();
  const { data } = useMeQuery({
    skip: !isLoggedIn,
  });

  const { pathname } = useLocation();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const {
    id,
    body,
    images,
    user,
    group,
    event,
    sharedPost,
    sharedProposal,
    hasMissingSharedProposal,
    hasMissingSharedPost,
    createdAt,
  } = post;

  const me = data && data.me;
  const isMe = me?.id === user.id;
  const formattedDate = timeAgo(createdAt);

  const groupPath = getGroupPath(group?.name || '');
  const isEventPage = pathname.includes(NavigationPaths.Events);
  const isGroupPage = pathname.includes(`${NavigationPaths.Groups}/`);
  const isPostPage = pathname.includes(NavigationPaths.Posts);
  const postPath = `${NavigationPaths.Posts}/${id}`;
  const userProfilePath = getUserProfilePath(user?.name);

  const isSmallTextOnly =
    body &&
    body.length < 85 &&
    !images.length &&
    !sharedPost &&
    !hasMissingSharedPost &&
    !sharedProposal &&
    !hasMissingSharedProposal;

  const bodyStyles: SxProps = {
    lineHeight: 1.25,
    whiteSpace: 'pre-wrap',
    marginBottom: 2.1,
    fontSize: isSmallTextOnly ? 22 : 16,
  };

  const cardContentStyles: SxProps = {
    paddingTop: 2.1,
    paddingX: inModal ? 0 : undefined,
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

    const canManagePosts =
      me?.serverPermissions.managePosts || group?.myPermissions?.managePosts;
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

  const renderPost = () => (
    <>
      <CardHeader
        action={renderMenu()}
        avatar={renderAvatar()}
        title={renderTitle()}
        sx={{
          paddingX: inModal ? 0 : undefined,
          paddingTop: inModal ? 0 : undefined,
        }}
      />

      <CardContent sx={cardContentStyles}>
        <FormattedText text={body} sx={bodyStyles} />

        {!!images.length && (
          <Link aria-label={t('images.labels.attachedImages')} href={postPath}>
            <AttachedImageList images={images} fillCard />
          </Link>
        )}

        {(sharedPost || hasMissingSharedPost) && (
          <SharedPost post={sharedPost} />
        )}

        {(sharedProposal || hasMissingSharedProposal) && (
          <SharedProposal proposal={sharedProposal} />
        )}
      </CardContent>

      <PostCardFooter
        eventId={event?.id}
        groupId={group?.id}
        inModal={inModal}
        isPostPage={isPostPage}
        post={post}
      />
    </>
  );

  if (inModal) {
    return renderPost();
  }

  return <Card {...cardProps}>{renderPost()}</Card>;
};

export default PostCard;
