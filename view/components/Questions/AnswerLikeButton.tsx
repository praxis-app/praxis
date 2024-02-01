// TODO: Add remaining layout and functionality. Below is a WIP

import { useReactiveVar } from '@apollo/client';
import { Favorite as LikeIcon } from '@mui/icons-material';
import { SxProps } from '@mui/material';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { TypeNames } from '../../constants/shared.constants';
import { isLoggedInVar } from '../../graphql/cache';
import { useDeleteLikeMutation } from '../../graphql/likes/mutations/gen/DeleteLike.gen';
import {
  LikesPopoverDocument,
  LikesPopoverQuery,
} from '../../graphql/likes/queries/gen/LikesPopover.gen';
import { useLikeAnswerMutation } from '../../graphql/questions/mutations/gen/LikeAnswer.gen';
import { Blurple } from '../../styles/theme';
import CardFooterButton from '../Shared/CardFooterButton';

interface Props {
  answerId?: number;
  isLikedByMe: boolean;
}

const AnsweredLikeButton = ({ answerId, isLikedByMe }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);
  const [likeAnswer, { loading: likeAnswerLoading }] = useLikeAnswerMutation();
  const [unlikeAnswer, { loading: unlikeAnswerLoading }] =
    useDeleteLikeMutation();

  const { t } = useTranslation();

  const isLoading = likeAnswerLoading || unlikeAnswerLoading;

  const likeButtonIconStyles: SxProps = {
    color: isLikedByMe && !isLoading ? Blurple.Marina : undefined,
    marginRight: '0.4ch',
  };

  const handleLikeButtonClick = async () => {
    const variables = {
      likeData: { answerId },
      isLoggedIn,
    };
    if (isLikedByMe) {
      unlikeAnswer({
        variables,
        update(cache) {
          const cacheId = cache.identify({
            __typename: TypeNames.Answer,
            id: answerId,
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
            variables: { answerId },
          });
          if (likesQuery) {
            cache.evict({
              fieldName: 'likes',
              args: { answerId },
            });
          }
        },
      });
      return;
    }
    await likeAnswer({
      variables,
      update(cache, { data }) {
        if (!data) {
          return;
        }
        cache.updateQuery<LikesPopoverQuery>(
          {
            query: LikesPopoverDocument,
            variables: { answerId },
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
      disabled={isLoading || !answerId}
      onClick={handleLikeButtonClick}
    >
      <LikeIcon sx={likeButtonIconStyles} />
      {t('actions.like')}
    </CardFooterButton>
  );
};

export default AnsweredLikeButton;
