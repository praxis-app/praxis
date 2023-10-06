import { useReactiveVar } from '@apollo/client';
import { Favorite as LikeIcon } from '@mui/icons-material';
import { SxProps } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { isLoggedInVar, toastVar } from '../../apollo/cache';
import { useDeleteLikeMutation } from '../../apollo/likes/generated/DeleteLike.mutation';
import { useLikePostMutation } from '../../apollo/posts/generated/LikePost.mutation';
import { TypeNames } from '../../constants/shared.constants';
import { Blurple } from '../../styles/theme';
import CardFooterButton from '../Shared/CardFooterButton';
import { ICON_STYLES } from './PostCardFooter';

interface Props {
  postId: number;
  isLikedByMe: boolean;
}

const LikeButton = ({ postId, isLikedByMe }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [likePost, { loading: likePostLoading }] = useLikePostMutation();
  const [unlikePost, { loading: unlikePostLoading }] = useDeleteLikeMutation();

  const { t } = useTranslation();

  const isLoading = likePostLoading || unlikePostLoading;

  const likeButtonIconStyles: SxProps =
    isLikedByMe && !isLoading
      ? {
          ...ICON_STYLES,
          color: Blurple.Marina,
        }
      : ICON_STYLES;

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
              likesCount: (existingCount: number) => existingCount - 1,
            },
          });
        },
      });
      return;
    }
    await likePost({ variables });
  };

  return (
    <CardFooterButton
      sx={isLikedByMe ? { color: Blurple.Marina } : {}}
      disabled={isLoading}
      onClick={handleLikeButtonClick}
    >
      <LikeIcon sx={likeButtonIconStyles} />
      {t('actions.like')}
    </CardFooterButton>
  );
};

export default LikeButton;
