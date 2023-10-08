import { Box, SxProps, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../apollo/cache';
import { CommentFragment } from '../../apollo/comments/generated/Comment.fragment';
import { useDeleteCommentMutation } from '../../apollo/comments/generated/DeleteComment.mutation';
import { TypeNames } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { getUserProfilePath } from '../../utils/user.utils';
import AttachedImageList from '../Images/AttachedImageList';
import Flex from '../Shared/Flex';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import CommentForm from './CommentForm';

interface Props {
  canManageComments: boolean;
  comment: CommentFragment;
  currentUserId?: number;
  postId?: number;
  proposalId?: number;
}

const Comment = ({
  comment,
  canManageComments,
  currentUserId,
  postId,
  proposalId,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [deleteComment] = useDeleteCommentMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const { id, user, body, images, __typename } = comment;
  const isMe = user.id === currentUserId;
  const userPath = getUserProfilePath(user.name);
  const deleteCommentPrompt = t('prompts.deleteItem', { itemType: 'comment' });

  const itemMenuStyles: SxProps = {
    alignSelf: 'center',
    marginLeft: 0.5,
    width: 40,
    height: 40,
  };

  const handleDelete = async () =>
    await deleteComment({
      variables: { id },
      update(cache) {
        if (postId) {
          cache.modify({
            id: cache.identify({ id: postId, __typename: TypeNames.Post }),
            fields: {
              commentCount(existingCount: number) {
                return Math.max(0, existingCount - 1);
              },
            },
          });
        }
        if (proposalId) {
          cache.modify({
            id: cache.identify({
              id: proposalId,
              __typename: TypeNames.Proposal,
            }),
            fields: {
              commentCount(existingCount: number) {
                return Math.max(0, existingCount - 1);
              },
            },
          });
        }
        const cacheId = cache.identify({ __typename, id });
        cache.evict({ id: cacheId });
        cache.gc();
      },
      onCompleted() {
        setMenuAnchorEl(null);
      },
      onError(err) {
        toastVar({
          status: 'error',
          title: err.message,
        });
        setMenuAnchorEl(null);
      },
    });

  if (showEditForm) {
    return (
      <CommentForm
        editComment={comment}
        onSubmit={() => {
          setShowEditForm(false);
          setMenuAnchorEl(null);
        }}
        enableAutoFocus
        expanded
      />
    );
  }

  return (
    <Flex
      marginBottom={1.25}
      onMouseEnter={() => setShowItemMenu(true)}
      onMouseLeave={() => setShowItemMenu(false)}
    >
      <UserAvatar
        sx={{ marginRight: 1, marginTop: 0.2 }}
        user={user}
        size={35}
        withLink
      />

      <Box
        sx={{ backgroundColor: 'background.secondary' }}
        maxWidth={isDesktop ? 'calc(100% - 90px)' : undefined}
        borderRadius={4}
        paddingX={1.5}
        paddingY={0.5}
      >
        <Link href={userPath} sx={{ fontFamily: 'Inter Medium' }}>
          {user.name}
        </Link>
        <Typography lineHeight={1.2}>{body}</Typography>

        {!!images.length && (
          <AttachedImageList
            images={images}
            width={250}
            paddingX={2}
            paddingBottom={1}
            paddingTop={1.5}
          />
        )}
      </Box>

      {showItemMenu && (
        <ItemMenu
          anchorEl={menuAnchorEl}
          buttonStyles={itemMenuStyles}
          canDelete={isMe || canManageComments}
          canUpdate={isMe}
          deleteItem={handleDelete}
          deletePrompt={deleteCommentPrompt}
          onEditButtonClick={() => setShowEditForm(true)}
          setAnchorEl={setMenuAnchorEl}
        />
      )}
    </Flex>
  );
};

export default Comment;
