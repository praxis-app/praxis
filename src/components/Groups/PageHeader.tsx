import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  Card,
  CardContent as MUICardContent,
  CardHeader,
  CircularProgress,
  createStyles,
  Typography,
  withStyles,
} from "@material-ui/core";
import { ChevronRight, HowToVote } from "@material-ui/icons";
import Link from "next/link";

import {
  COVER_PHOTO_BY_GROUP_ID,
  MEMBER_REUQESTS,
} from "../../apollo/client/queries";
import { GroupSettings, SettingStates } from "../../constants/setting";
import {
  useCurrentUser,
  useHasPermissionByGroupId,
  useMembersByGroupId,
  useSettingsByGroupId,
} from "../../hooks";
import { WHITE } from "../../styles/Shared/theme";
import { NavigationPaths, ResourcePaths } from "../../constants/common";
import Messages from "../../utils/messages";
import JoinButton from "./JoinButton";
import { VotingTypes } from "../../constants/vote";
import { noCache, settingValue } from "../../utils/clientIndex";
import { GroupPermissions } from "../../constants/role";
import GroupItemMenu from "./ItemMenu";
import CoverPhoto from "../Images/CoverPhoto";

const CardContent = withStyles(() =>
  createStyles({
    root: {
      marginTop: 6,
      "&:last-child": {
        paddingBottom: 12,
      },
    },
  })
)(MUICardContent);

const NameTypography = withStyles(() =>
  createStyles({
    root: {
      fontFamily: "Inter Bold",
      marginBottom: 6,
      maxWidth: "60%",
    },
  })
)(Typography);

interface Props {
  group: ClientGroup;
  deleteGroup: (id: string) => void;
}

const GroupPageHeader = ({ group, deleteGroup }: Props) => {
  const { id, name } = group;
  const [groupSettings, _, groupSettingsLoading] = useSettingsByGroupId(id);
  const [groupMembers, setGroupMembers, groupMembersLoading] =
    useMembersByGroupId(group.id);
  const [coverPhoto, setCoverPhoto] = useState<ClientImage>();
  const [memberRequests, setMemberRequests] = useState<ClientMemberRequest[]>(
    []
  );
  const currentUser = useCurrentUser();
  const memberVariables = {
    variables: { groupId: group.id },
    ...noCache,
  };
  const memberRequestsRes = useQuery(MEMBER_REUQESTS, memberVariables);
  const coverPhotoRes = useQuery(COVER_PHOTO_BY_GROUP_ID, {
    variables: { groupId: group.id },
    ...noCache,
  });
  const [canEdit] = useHasPermissionByGroupId(GroupPermissions.EditGroup, id);
  const [canDelete] = useHasPermissionByGroupId(
    GroupPermissions.DeleteGroup,
    id
  );
  const [canManageRoles] = useHasPermissionByGroupId(
    GroupPermissions.ManageRoles,
    id
  );
  const [canManageSettings] = useHasPermissionByGroupId(
    GroupPermissions.ManageSettings,
    id
  );
  const [canAcceptMemberRequests] = useHasPermissionByGroupId(
    GroupPermissions.AcceptMemberRequests,
    id
  );

  useEffect(() => {
    if (coverPhotoRes.data)
      setCoverPhoto(coverPhotoRes.data.coverPhotoByGroupId);
  }, [coverPhotoRes.data]);

  useEffect(() => {
    if (memberRequestsRes.data)
      setMemberRequests(memberRequestsRes.data.memberRequests);
  }, [memberRequestsRes.data]);

  const isNoAdmin = (): boolean => {
    return (
      settingValue(GroupSettings.NoAdmin, groupSettings) === SettingStates.On
    );
  };

  const isAMember = (): boolean => {
    const member = groupMembers?.find(
      (member: ClientGroupMember) => member.userId === currentUser?.id
    );
    return Boolean(member);
  };

  const canSeeRequests = (): boolean => {
    if (canAcceptMemberRequests) return true;
    if (isNoAdmin() && isAMember()) return true;
    return false;
  };

  const votingType = (): string => {
    const setting = settingValue(GroupSettings.VotingType, groupSettings);
    const votingTypes = Messages.groups.votingTypeLabels;
    switch (setting) {
      case VotingTypes.Majority:
        return votingTypes.majority();
      case VotingTypes.XToPass:
        return votingTypes.xToPass();
      default:
        return votingTypes.consensus();
    }
  };

  const showItemMenu =
    currentUser &&
    !isNoAdmin() &&
    (canEdit || canDelete || canManageSettings || canManageRoles);

  if (
    memberRequestsRes.loading ||
    coverPhotoRes.loading ||
    groupSettingsLoading ||
    groupMembersLoading
  )
    return <CircularProgress />;

  return (
    <Card>
      <CoverPhoto path={coverPhoto?.path} />

      {(showItemMenu || currentUser) && (
        <CardHeader
          action={
            <>
              {currentUser && (
                <JoinButton
                  group={group}
                  memberRequests={memberRequests}
                  groupMembers={groupMembers}
                  setMemberRequests={setMemberRequests}
                  setGroupMembers={setGroupMembers}
                />
              )}

              {showItemMenu && (
                <GroupItemMenu
                  group={group}
                  deleteGroup={deleteGroup}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  canManageRoles={canManageRoles}
                  canManageSettings={canManageSettings}
                />
              )}
            </>
          }
          style={{ marginTop: 6 }}
        />
      )}

      <CardContent>
        <Link href={`${ResourcePaths.Group}${name}${NavigationPaths.About}`}>
          <a>
            <NameTypography
              variant="h5"
              color="primary"
              style={{
                marginTop: showItemMenu ? -80 : -72,
              }}
            >
              {group.name}
              <ChevronRight style={{ marginBottom: -4 }} />
            </NameTypography>
          </a>
        </Link>

        <Link href={`${ResourcePaths.Group}${name}${NavigationPaths.About}`}>
          <a>
            <HowToVote
              fontSize="small"
              style={{ marginBottom: -3, marginRight: "0.3ch" }}
            />
            {votingType() + Messages.middotWithSpaces()}
          </a>
        </Link>

        <Link href={`${ResourcePaths.Group}${name}${NavigationPaths.Members}`}>
          <a>{Messages.groups.members(groupMembers.length)}</a>
        </Link>

        {canSeeRequests() && Boolean(memberRequests.length) && (
          <>
            <span style={{ color: WHITE }}>{Messages.middotWithSpaces()}</span>

            <Link
              href={`${ResourcePaths.Group}${name}${NavigationPaths.Requests}`}
            >
              <a>{Messages.groups.requests(memberRequests.length)}</a>
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default GroupPageHeader;
