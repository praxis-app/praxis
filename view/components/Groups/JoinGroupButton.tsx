import { Reference } from '@apollo/client';
import { styled } from '@mui/material';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TypeNames } from '../../constants/shared.constants';
import { toastVar } from '../../graphql/cache';
import { useCancelGroupMemberRequestMutation } from '../../graphql/groups/mutations/gen/CancelGroupMemberRequest.gen';
import { useCreateGroupMemberRequestMutation } from '../../graphql/groups/mutations/gen/CreateGroupMemberRequest.gen';
import { useLeaveGroupMutation } from '../../graphql/groups/mutations/gen/LeaveGroup.gen';
import {
  GroupMemberRequestDocument,
  GroupMemberRequestQuery,
  useGroupMemberRequestQuery,
} from '../../graphql/groups/queries/gen/GroupMemberRequest.gen';
import {
  MemberRequestsDocument,
  MemberRequestsQuery,
} from '../../graphql/groups/queries/gen/MemberRequests.gen';
import { useIsDesktop } from '../../hooks/shared.hooks';
import GhostButton from '../Shared/GhostButton';

const Button = styled(GhostButton)(() => ({
  marginRight: 8,
  minWidth: 80,
}));

interface Props {
  groupId: number;
  currentUserId?: number;
  isGroupMember?: boolean;
}

const JoinGroupButton = ({ groupId, currentUserId, isGroupMember }: Props) => {
  const { data, loading } = useGroupMemberRequestQuery({
    variables: { groupId },
  });
  const [createMemberRequest, { loading: createLoading }] =
    useCreateGroupMemberRequestMutation();
  const [cancelMemberRequest, { loading: cancelLoading }] =
    useCancelGroupMemberRequestMutation();
  const [leaveGroup, { loading: leaveGroupLoading }] = useLeaveGroupMutation();
  const [isHovering, setIsHovering] = useState(false);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  if (!data) {
    return <Button disabled>{t('groups.actions.join')}</Button>;
  }

  const { groupMemberRequest } = data;

  const getButtonText = () => {
    if (isGroupMember) {
      if (isHovering) {
        return t('groups.actions.leave');
      }
      return t('groups.labels.joined');
    }
    if (!groupMemberRequest) {
      return t('groups.actions.join');
    }
    return t('groups.actions.cancelRequest');
  };

  const handleJoin = async () =>
    await createMemberRequest({
      variables: { groupId },
      update(cache, { data }) {
        if (!data) {
          return;
        }
        const {
          createGroupMemberRequest: { groupMemberRequest },
        } = data;
        cache.writeQuery<GroupMemberRequestQuery>({
          query: GroupMemberRequestDocument,
          variables: { groupId },
          data: { groupMemberRequest },
        });
        cache.updateQuery<MemberRequestsQuery>(
          {
            query: MemberRequestsDocument,
            variables: {
              groupName: groupMemberRequest.group.name,
            },
          },
          (memberRequestsData) =>
            produce(memberRequestsData, (draft) => {
              draft?.group.memberRequests?.unshift(groupMemberRequest);
            }),
        );
        cache.modify({
          id: cache.identify(groupMemberRequest.group),
          fields: {
            memberRequestCount(existingCount: number) {
              return existingCount + 1;
            },
          },
        });
      },
    });

  const handleCancelRequest = async (id: number) =>
    await cancelMemberRequest({
      variables: { id },
      update(cache) {
        cache.writeQuery<GroupMemberRequestQuery>({
          query: GroupMemberRequestDocument,
          variables: { groupId },
          data: { groupMemberRequest: null },
        });
        cache.evict({
          id: cache.identify({ id, __typename: TypeNames.MemberRequest }),
        });
        cache.gc();
      },
    });

  const handleLeave = async () =>
    await leaveGroup({
      variables: { id: groupId },
      update(cache) {
        cache.writeQuery<GroupMemberRequestQuery>({
          query: GroupMemberRequestDocument,
          variables: { groupId },
          data: { groupMemberRequest: null },
        });
        cache.modify({
          id: cache.identify({ id: groupId, __typename: TypeNames.Group }),
          fields: {
            members(existingRefs: Reference[], { readField }) {
              return existingRefs.filter(
                (ref) => readField('id', ref) !== currentUserId,
              );
            },
            memberCount(existingCount: number) {
              return Math.max(0, existingCount - 1);
            },
            isJoinedByMe() {
              return false;
            },
          },
        });
      },
    });

  const handleButtonClick = async () => {
    try {
      if (isGroupMember) {
        const confirmed = window.confirm(t('groups.prompts.confirmLeave'));
        if (confirmed) {
          await handleLeave();
        }
        return;
      }
      if (!groupMemberRequest) {
        await handleJoin();
        return;
      }
      await handleCancelRequest(groupMemberRequest.id);
    } catch (err) {
      toastVar({
        status: 'error',
        title: String(err),
      });
    }
  };

  const handleMouseEnter = () => {
    if (!isDesktop) {
      return;
    }
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    if (!isDesktop) {
      return;
    }
    setIsHovering(false);
  };

  return (
    <Button
      disabled={cancelLoading || createLoading || leaveGroupLoading || loading}
      onClick={handleButtonClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {getButtonText()}
    </Button>
  );
};

export default JoinGroupButton;
