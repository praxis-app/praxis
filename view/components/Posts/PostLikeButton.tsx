import { useReactiveVar } from '@apollo/client';
import { Favorite as LikeIcon } from '@mui/icons-material';
import { SxProps } from '@mui/material';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { TypeNames } from '../../constants/shared.constants';
import { isLoggedInVar, toastVar } from '../../graphql/cache';
import { useDeleteLikeMutation } from '../../graphql/likes/mutations/gen/DeleteLike.gen';
import {
  LikesPopoverDocument,
  LikesPopoverQuery,
} from '../../graphql/likes/queries/gen/LikesPopover.gen';
import { useLikePostMutation } from '../../graphql/posts/mutations/gen/LikePost.gen';
import { Blurple } from '../../styles/theme';
import CardFooterButton from '../Shared/CardFooterButton';

interface Props {
  postId: number;
  isLikedByMe: boolean;
}

const PostLikeButton = ({ postId, isLikedByMe }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [likePost, { loading: likePostLoading }] = useLikePostMutation();
  const [unlikePost, { loading: unlikePostLoading }] = useDeleteLikeMutation();

  const { t } = useTranslation();

  const isLoading = likePostLoading || unlikePostLoading;

  const likeButtonIconStyles: SxProps = {
    color: isLikedByMe && !isLoading ? Blurple.Marina : undefined,
    marginRight: '0.4ch',
  };

  const handleLikeButtonClick = async () => {
    if (!isLoggedIn) {
      toastVar({
        title: t('posts.prompts.loginToLike'),
        status: 'info',
      });
      return;
    }
    const variables = { likeData: { postId } };
    if (isLikedByMe) {
      unlikePost({
        variables,
        update(cache) {
          const cacheId = cache.identify({
            __typename: TypeNames.Post,
            id: postId,
          });
          cache.modify({
            id: cacheId,
            fields: {
              isLikedByMe: () => false,
              likeCount: (existingCount: number) => existingCount - 1,
            },
          });
          const likesQuery = cache.readQuery({
            query: LikesPopoverDocument,
            variables: { postId },
          });
          if (likesQuery) {
            cache.evict({
              fieldName: 'likes',
              args: { postId },
            });
          }
        },
      });
      return;
    }
    await likePost({
      variables,
      update(cache, { data }) {
        if (!data) {
          return;
        }
        cache.updateQuery<LikesPopoverQuery>(
          {
            query: LikesPopoverDocument,
            variables: { postId },
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
    <CardFooterButton
      sx={isLikedByMe ? { color: Blurple.SavoryBlue } : {}}
      disabled={isLoading}
      onClick={handleLikeButtonClick}
    >
      <LikeIcon sx={likeButtonIconStyles} />
      {t('actions.like')}
    </CardFooterButton>
  );
};

export default PostLikeButton;
