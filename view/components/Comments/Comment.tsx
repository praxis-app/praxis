import { Box, SxProps, Typography } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TypeNames } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { CommentFragment } from '../../graphql/comments/fragments/gen/Comment.gen';
import { useDeleteCommentMutation } from '../../graphql/comments/mutations/gen/DeleteComment.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { timeAgo } from '../../utils/time.utils';
import { getUserProfilePath } from '../../utils/user.utils';
import AttachedImageList from '../Images/AttachedImageList';
import LikesModal from '../Likes/LikesModal';
import Flex from '../Shared/Flex';
import FormattedText from '../Shared/FormattedText';
import ItemMenu from '../Shared/ItemMenu';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';
import CommentForm from './CommentForm';
import CommentLikeButton from './CommentLikeButton';
import CommentLikeCount from './CommentLikeCount';

interface Props {
  canManageComments?: boolean;
  comment: CommentFragment;
  currentUserId?: number;
  postId?: number;
  proposalId?: number;
  questionnaireTicketId?: number;
  questionId?: number;
}

const Comment = ({
  canManageComments,
  comment,
  currentUserId,
  postId,
  proposalId,
  questionnaireTicketId,
  questionId,
}: Props) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [showItemMenu, setShowItemMenu] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [rightLikeCount, setRightLikeCount] = useState(false);
  const [showLikesModal, setShowLikesModal] = useState(false);

  const [deleteComment, { loading: deleteCommentLoading }] =
    useDeleteCommentMutation();

  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const isDesktop = useIsDesktop();

  const { id, user, body, images, createdAt, likeCount, __typename } = comment;

  useEffect(() => {
    if (likeCount && ref.current && ref.current.offsetWidth < 200) {
      setRightLikeCount(true);
    } else {
      setRightLikeCount(false);
    }
  }, [likeCount, ref.current?.offsetWidth]);

  const isMe = user.id === currentUserId;
  const deleteCommentPrompt = t('prompts.deleteItem', { itemType: 'comment' });
  const userPath = getUserProfilePath(user.name);
  const formattedDate = timeAgo(createdAt);

  const itemMenuStyles: SxProps = {
    alignSelf: 'center',
    marginLeft: 0.5,
    position: 'absolute',
    right: -47,
    width: 40,
    height: 40,
  };

  const getCommentBodyRightMargin = () => {
    if (!rightLikeCount) {
      return '0px';
    }
    if (likeCount > 99) {
      return '52px';
    }
    if (likeCount > 9) {
      return '42px';
    }
    if (likeCount > 1) {
      return '35px';
    }
    return '15px';
  };

  const handleDelete = async () =>
    await deleteComment({
      variables: { id },
      update(cache) {
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
        if (questionId) {
          cache.modify({
            id: cache.identify({
              id: questionId,
              __typename: TypeNames.Question,
            }),
            fields: {
              commentCount(existingCount: number) {
                return Math.max(0, existingCount - 1);
              },
            },
          });
        }
        if (questionnaireTicketId) {
          cache.modify({
            id: cache.identify({
              id: questionnaireTicketId,
              __typename: TypeNames.QuestionnaireTicket,
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

      <Box maxWidth={isDesktop ? 'calc(100% - 90px)' : undefined}>
        <Flex position="relative">
          <Box
            bgcolor="background.secondary"
            borderRadius={4}
            marginRight={getCommentBodyRightMargin()}
            minWidth="85px"
            paddingX={1.5}
            paddingY={1}
            position="relative"
            ref={ref}
          >
            <Link href={userPath} sx={{ fontFamily: 'Inter Medium' }}>
              {user.displayName || user.name}
            </Link>

            <FormattedText text={body} lineHeight={1.2} paddingY={0.4} />

            {!!images.length && (
              <AttachedImageList
                images={images}
                width={250}
                paddingBottom={1}
                paddingTop={1.5}
              />
            )}

            {!!likeCount && (
              <CommentLikeCount
                commentId={id}
                likeCount={likeCount}
                onClick={() => setShowLikesModal(true)}
                rightLikeCount={rightLikeCount}
              />
            )}

            <LikesModal
              open={showLikesModal}
              onClose={() => setShowLikesModal(false)}
              commentId={id}
            />
          </Box>

          {showItemMenu && isDesktop && (
            <ItemMenu
              anchorEl={menuAnchorEl}
              buttonStyles={itemMenuStyles}
              canDelete={isMe || canManageComments}
              canUpdate={isMe}
              deleteItem={handleDelete}
              deletePrompt={deleteCommentPrompt}
              loading={deleteCommentLoading}
              onEditButtonClick={() => setShowEditForm(true)}
              setAnchorEl={setMenuAnchorEl}
            />
          )}
        </Flex>

        <Flex paddingLeft="12px" paddingTop="4px" gap="8px">
          <Typography fontSize="13px" color="text.secondary" lineHeight={1}>
            {formattedDate}
          </Typography>
          <CommentLikeButton
            comment={comment}
            isPostComment={!!postId}
            isProposalComment={!!proposalId}
          />
        </Flex>
      </Box>
    </Flex>
  );
};

export default Comment;
