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
import { useLikeQuestionMutation } from '../../graphql/questions/mutations/gen/LikeQuestion.gen';
import { Blurple } from '../../styles/theme';
import CardFooterButton from '../Shared/CardFooterButton';

interface Props {
  questionId?: number;
  isLikedByMe: boolean;
}

const QuestionLikeButton = ({ questionId, isLikedByMe }: Props) => {
  const isLoggedIn = useReactiveVar(isLoggedInVar);

  const [likeQuestion, { loading: likeQuestionLoading }] =
    useLikeQuestionMutation();
  const [unlikeQuestion, { loading: unlikeQuestionLoading }] =
    useDeleteLikeMutation();

  const { t } = useTranslation();

  const isLoading = likeQuestionLoading || unlikeQuestionLoading;

  const likeButtonIconStyles: SxProps = {
    color: isLikedByMe && !isLoading ? Blurple.Marina : undefined,
    marginRight: '0.4ch',
  };

  const handleLikeButtonClick = async () => {
    const variables = {
      likeData: { questionId },
      isLoggedIn,
    };
    if (isLikedByMe) {
      unlikeQuestion({
        variables,
        update(cache) {
          const cacheId = cache.identify({
            __typename: TypeNames.Question,
            id: questionId,
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
            variables: { questionId },
          });
          if (likesQuery) {
            cache.evict({
              fieldName: 'likes',
              args: { questionId },
            });
          }
        },
      });
      return;
    }
    await likeQuestion({
      variables,
      update(cache, { data }) {
        if (!data) {
          return;
        }
        cache.updateQuery<LikesPopoverQuery>(
          {
            query: LikesPopoverDocument,
            variables: { questionId },
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

export default QuestionLikeButton;
