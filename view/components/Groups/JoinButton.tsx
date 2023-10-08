import { Reference } from '@apollo/client';
import { styled } from '@mui/material';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toastVar } from '../../apollo/cache';
import { useCancelGroupMemberRequestMutation } from '../../apollo/groups/generated/CancelGroupMemberRequest.mutation';
import { useCreateGroupMemberRequestMutation } from '../../apollo/groups/generated/CreateGroupMemberRequest.mutation';
import {
  GroupMemberRequestDocument,
  GroupMemberRequestQuery,
  useGroupMemberRequestQuery,
} from '../../apollo/groups/generated/GroupMemberRequest.query';
import { useLeaveGroupMutation } from '../../apollo/groups/generated/LeaveGroup.mutation';
import {
  MemberRequestsDocument,
  MemberRequestsQuery,
} from '../../apollo/groups/generated/MemberRequests.query';
import { TypeNames } from '../../constants/shared.constants';
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

const JoinButton = ({ groupId, currentUserId, isGroupMember }: Props) => {
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
        await handleLeave();
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

  const handleButtonClickWithConfirm = () =>
    window.confirm(t('groups.prompts.confirmLeave')) && handleButtonClick();

  return (
    <Button
      disabled={cancelLoading || createLoading || leaveGroupLoading || loading}
      onClick={isGroupMember ? handleButtonClickWithConfirm : handleButtonClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {getButtonText()}
    </Button>
  );
};

export default JoinButton;
