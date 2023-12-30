import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TypeNames } from '../../constants/shared.constants';
import { FollowButtonFragment } from '../../graphql/users/fragments/gen/FollowButton.gen';
import { useFollowUserMutation } from '../../graphql/users/mutations/gen/FollowUser.gen';
import { useUnfollowUserMutation } from '../../graphql/users/mutations/gen/UnfollowUser.gen';
import {
  FollowersDocument,
  FollowersQuery,
} from '../../graphql/users/queries/gen/Followers.gen';
import {
  HomeFeedDocument,
  HomeFeedQuery,
} from '../../graphql/users/queries/gen/HomeFeed.gen';
import GhostButton from '../Shared/GhostButton';

interface Props {
  currentUserId: number;
  user: FollowButtonFragment;
}

const FollowButton = ({
  user: { id, name, isFollowedByMe, __typename },
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
            {
              query: HomeFeedDocument,
              variables: { limit: 10, offset: 0, isLoggedIn: true },
            },
            (homePageData) =>
              produce(homePageData, (draft) => {
                if (!draft?.me) {
                  return;
                }
                draft.me.homeFeed.nodes = draft.me.homeFeed.nodes.filter(
                  ({ user, group }) => user.id !== id || !!group?.id,
                );
              }),
          );
          cache.updateQuery<FollowersQuery>(
            {
              query: FollowersDocument,
              variables: { limit: 10, offset: 0, name },
            },
            (homePageData) =>
              produce(homePageData, (draft) => {
                if (!draft) {
                  return;
                }
                draft.user.followers.nodes = draft.user.followers.nodes.filter(
                  ({ id: userId }) => userId !== id,
                );
                draft.user.followers.totalCount -= 1;
              }),
          );
          cache.modify({
            id: cache.identify({ id, __typename }),
            fields: {
              isFollowedByMe: () => false,
              followerCount(existingCount: number) {
                return Math.max(0, existingCount - 1);
              },
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
    await followUser({
      variables: { id },
      update: (cache) => {
        const followerQuery = cache.readQuery({
          query: FollowersDocument,
          variables: { limit: 10, offset: 0, name },
        });
        if (followerQuery) {
          cache.evict({
            id: `${TypeNames.User}:${id}`,
            fieldName: 'followers',
          });
        }
        const homeFeed = cache.readQuery({
          query: HomeFeedDocument,
          variables: { limit: 10, offset: 0, isLogged: true },
        });
        if (homeFeed) {
          cache.evict({
            id: `${TypeNames.User}:${currentUserId}`,
            fieldName: 'homeFeed',
          });
        }
      },
    });
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
