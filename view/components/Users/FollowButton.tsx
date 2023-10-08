import { Reference } from '@apollo/client';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FollowButtonFragment } from '../../apollo/users/generated/FollowButton.fragment';
import { useFollowUserMutation } from '../../apollo/users/generated/FollowUser.mutation';
import {
  HomeFeedDocument,
  HomeFeedQuery,
} from '../../apollo/users/generated/HomeFeed.query';
import { useUnfollowUserMutation } from '../../apollo/users/generated/UnfollowUser.mutation';
import GhostButton from '../Shared/GhostButton';

interface Props {
  currentUserId: number;
  user: FollowButtonFragment;
}

const FollowButton = ({
  user: { id, isFollowedByMe, __typename },
  currentUserId,
}: Props) => {
  const [isHovering, setIsHovering] = useState(false);
  const [followUser, { loading: followLoading }] = useFollowUserMutation();
  const [unfollowUser, { loading: unfollowLoading }] =
    useUnfollowUserMutation();

  const { t } = useTranslation();

  const getButtonText = () => {
    if (isFollowedByMe) {
      if (isHovering) {
        return t('users.actions.unfollow');
      }
      return t('users.profile.following');
    }
    return t('users.actions.follow');
  };

  const handleClick = async () => {
    if (isFollowedByMe) {
      await unfollowUser({
        variables: { id },
        update(cache) {
          cache.updateQuery<HomeFeedQuery>(
            { query: HomeFeedDocument },
            (homePageData) =>
              produce(homePageData, (draft) => {
                if (!draft?.me) {
                  return;
                }
                draft.me.homeFeed = draft.me.homeFeed.filter(
                  ({ user, group }) => user.id !== id || !!group?.id,
                );
              }),
          );
          cache.modify({
            id: cache.identify({ id, __typename }),
            fields: {
              followers(existingRefs: Reference[], { readField }) {
                return existingRefs.filter(
                  (ref) => readField('id', ref) !== currentUserId,
                );
              },
              followerCount(existingCount: number) {
                return Math.max(0, existingCount - 1);
              },
              isFollowedByMe: () => false,
            },
          });
          cache.modify({
            id: cache.identify({ id: currentUserId, __typename }),
            fields: {
              followingCount(existingCount: number) {
                return Math.max(0, existingCount - 1);
              },
            },
          });
        },
      });
      return;
    }
    await followUser({ variables: { id } });
  };

  const handleClickWithPrompt = () =>
    window.confirm(t('users.prompts.unfollow')) && handleClick();

  return (
    <GhostButton
      disabled={followLoading || unfollowLoading}
      onClick={isFollowedByMe ? handleClickWithPrompt : handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      sx={{ marginRight: 0.5 }}
    >
      {getButtonText()}
    </GhostButton>
  );
};

export default FollowButton;
