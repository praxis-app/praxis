import { useReactiveVar } from '@apollo/client';
import { ButtonBase } from '@mui/material';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, toastVar } from '../../graphql/cache';
import { CommentLikeButtonFragment } from '../../graphql/comments/fragments/gen/CommentLikeButton.gen';
import { useLikeCommentMutation } from '../../graphql/comments/mutations/gen/LikeComment.gen';
import { useDeleteLikeMutation } from '../../graphql/likes/mutations/gen/DeleteLike.gen';
import {
  LikesPopoverDocument,
  LikesPopoverQuery,
} from '../../graphql/likes/queries/gen/LikesPopover.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { Blurple } from '../../styles/theme';

interface Props {
  comment: CommentLikeButtonFragment;
}

const CommentLikeButton = ({
  comment: { id, isLikedByMe, __typename },
}: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [likeComment, { loading: likeCommentLoading }] =
    useLikeCommentMutation();

  const [unlikeComment, { loading: unlikeCommentLoading }] =
    useDeleteLikeMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const handleLikeBtnClick = async () => {
    if (!isLoggedIn) {
      toastVar({
        title: t('posts.prompts.loginToLike'),
        status: 'info',
      });
      return;
    }
    const variables = { likeData: { commentId: id }, isLoggedIn };
    if (isLikedByMe) {
      unlikeComment({
        variables,
        update(cache) {
          const cacheId = cache.identify({ id, __typename });
          cache.modify({
            id: cacheId,
            fields: {
              isLikedByMe: () => false,
              likeCount: (existingCount: number) => existingCount - 1,
            },
          });
          const likesQuery = cache.readQuery({
            query: LikesPopoverDocument,
            variables: { commentId: id },
          });
          if (likesQuery) {
            cache.evict({
              fieldName: 'likes',
              args: { commentId: id },
            });
          }
        },
      });
      return;
    }
    await likeComment({
      variables,
      update(cache, { data }) {
        if (!data) {
          return;
        }
        cache.updateQuery<LikesPopoverQuery>(
          {
            query: LikesPopoverDocument,
            variables: { commentId: id },
          },
          (likesData) =>
            produce(likesData, (draft) => {
              draft?.likes.unshift(data.createLike.like);
            }),
        );
      },
    });
  };

  return (
    <ButtonBase
      disabled={likeCommentLoading || unlikeCommentLoading}
      onClick={handleLikeBtnClick}
      sx={{
        borderRadius: '2px',
        color: isLikedByMe ? Blurple.SavoryBlue : 'text.secondary',
        fontFamily: 'Inter Medium',
        fontSize: isDesktop ? undefined : '13px',
        lineHeight: 1,
        paddingX: '4px',
      }}
    >
      {t('actions.like')}
    </ButtonBase>
  );
};

export default CommentLikeButton;
