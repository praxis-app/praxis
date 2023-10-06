// TODO: Rename as component and fragment as GroupMemberRequest

import { ApolloCache, Reference } from '@apollo/client';
import { Box, Button, styled, Typography } from '@mui/material';
import { produce } from 'immer';
import { useTranslation } from 'react-i18next';
import { useApproveGroupMemberRequestMutation } from '../../apollo/groups/generated/ApproveGroupMemberRequest.mutation';
import { useDenyGroupMemberRequestMutation } from '../../apollo/groups/generated/DenyGroupMemberRequest.mutation';
import { MemberRequestFragment } from '../../apollo/groups/generated/MemberRequest.fragment';
import {
  MemberRequestsDocument,
  MemberRequestsQuery,
  MemberRequestsQueryVariables,
} from '../../apollo/groups/generated/MemberRequests.query';
import { TypeNames } from '../../constants/shared.constants';
import { getUserProfilePath } from '../../utils/user.utils';
import SharedFlex from '../Shared/Flex';
import Link from '../Shared/Link';
import UserAvatar from '../Users/UserAvatar';

const Flex = styled(SharedFlex)(() => ({
  marginBottom: 15,
  '&:last-child': {
    marginBottom: 0,
  },
}));

interface Props {
  memberRequest: MemberRequestFragment;
  groupName: string;
}

const MemberRequest = ({
  memberRequest: { id, user, group, __typename },
  groupName,
}: Props) => {
  const [approve] = useApproveGroupMemberRequestMutation();
  const [deny] = useDenyGroupMemberRequestMutation();
  const { t } = useTranslation();

  const handleApproveButtonClick = async () =>
    await approve({
      variables: { id },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          approveGroupMemberRequest: { groupMember },
        } = data;
        cache.modify({
          id: cache.identify({ id, __typename }),
          fields: { status: () => 'approved' },
        });
        cache.modify({
          id: cache.identify(group),
          fields: {
            members(existingMemberRefs: Reference[], { toReference }) {
              return [toReference(groupMember), ...existingMemberRefs];
            },
            memberRequestCount(existingCount: number) {
              return Math.max(0, existingCount - 1);
            },
            memberCount(existingCount: number) {
              return existingCount + 1;
            },
          },
        });
        removeMemberRequest(cache);
      },
    });

  const handleDenyButtonClick = async () =>
    await deny({
      variables: { id },
      update(cache) {
        cache.modify({
          id: cache.identify(group),
          fields: {
            memberRequestCount(existingCount: number) {
              return Math.max(0, existingCount - 1);
            },
          },
        });
        removeMemberRequest(cache);
      },
    });

  const removeMemberRequest = (cache: ApolloCache<any>) => {
    cache.updateQuery<MemberRequestsQuery, MemberRequestsQueryVariables>(
      {
        query: MemberRequestsDocument,
        variables: { groupName },
      },
      (memberRequestsData) =>
        produce(memberRequestsData, (draft) => {
          if (!draft?.group.memberRequests) {
            return;
          }
          const index = draft.group.memberRequests.findIndex(
            (p) => p.id === id,
          );
          draft.group.memberRequests.splice(index, 1);
        }),
    );
    const cacheId = cache.identify({ id, __typename: TypeNames.MemberRequest });
    cache.evict({ id: cacheId });
    cache.gc();
  };

  return (
    <Flex sx={{ justifyContent: 'space-between' }}>
      <Link href={getUserProfilePath(user.name)}>
        <Flex>
          <UserAvatar user={user} sx={{ marginRight: 1.5 }} />
          <Typography sx={{ marginTop: 1 }}>{user.name}</Typography>
        </Flex>
      </Link>

      <Box>
        <Button
          sx={{ color: 'text.primary' }}
          onClick={handleApproveButtonClick}
        >
          {t('groups.actions.approve')}
        </Button>
        <Button sx={{ color: 'text.primary' }} onClick={handleDenyButtonClick}>
          {t('groups.actions.deny')}
        </Button>
      </Box>
    </Flex>
  );
};

export default MemberRequest;
