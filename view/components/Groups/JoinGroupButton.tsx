import { Reference, useReactiveVar } from '@apollo/client';
import { ArrowDropDown, Logout } from '@mui/icons-material';
import { Menu, MenuItem, styled } from '@mui/material';
import { produce } from 'immer';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GROUP_PERMISSION_NAMES } from '../../constants/role.constants';
import { TypeNames } from '../../constants/shared.constants';
import { isVerifiedVar, toastVar } from '../../graphql/cache';
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
  const [isHovering, setIsHovering] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);

  const isVerified = useReactiveVar(isVerifiedVar);
  const { data: memberRequestData, loading: memberRequestLoading } =
    useGroupMemberRequestQuery({
      variables: { groupId },
      skip: !isVerified,
    });

  const [createMemberRequest, { loading: createLoading }] =
    useCreateGroupMemberRequestMutation();
  const [cancelMemberRequest, { loading: cancelLoading }] =
    useCancelGroupMemberRequestMutation();
  const [leaveGroup, { loading: leaveGroupLoading }] = useLeaveGroupMutation();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  if (!isVerified) {
    return (
      <Button
        onClick={() =>
          toastVar({
            title: t('groups.prompts.verifiedOnly'),
            status: 'info',
          })
        }
      >
        {t('groups.actions.join')}
      </Button>
    );
  }

  if (!memberRequestData) {
    return <Button disabled>{t('groups.actions.join')}</Button>;
  }

  const { groupMemberRequest } = memberRequestData;

  const isDisabled =
    cancelLoading || createLoading || leaveGroupLoading || memberRequestLoading;

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

  const handleLeave = async () => {
    const confirmed = window.confirm(t('groups.prompts.confirmLeave'));
    if (!confirmed) {
      return;
    }
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
            myPermissions() {
              return GROUP_PERMISSION_NAMES.reduce<Record<string, boolean>>(
                (acc, permission) => {
                  acc[permission] = false;
                  return acc;
                },
                {},
              );
            },
            isJoinedByMe() {
              return false;
            },
          },
        });
      },
    });
  };

  const handleButtonClick = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!isDesktop && isGroupMember) {
      setMenuAnchorEl(event.currentTarget);
      return;
    }
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

  const handleLeaveButtonClick = async () => {
    try {
      await handleLeave();
    } catch (err) {
      toastVar({
        status: 'error',
        title: String(err),
      });
    }
  };

  return (
    <>
      <Button
        disabled={isDisabled}
        onClick={handleButtonClick}
        onMouseEnter={isDesktop ? () => setIsHovering(true) : undefined}
        onMouseLeave={isDesktop ? () => setIsHovering(false) : undefined}
        endIcon={!isDesktop && isGroupMember ? <ArrowDropDown /> : null}
      >
        {getButtonText()}
      </Button>

      <Menu
        anchorEl={menuAnchorEl}
        onClick={() => setMenuAnchorEl(null)}
        onClose={() => setMenuAnchorEl(null)}
        open={!!menuAnchorEl}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal: 'right',
          vertical: -5,
        }}
        keepMounted
      >
        <MenuItem onClick={handleLeaveButtonClick}>
          <Logout sx={{ marginRight: '8px' }} />
          {t('groups.actions.leaveGroup')}
        </MenuItem>
      </Menu>
    </>
  );
};

export default JoinGroupButton;
