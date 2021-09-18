import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  CardHeader,
} from "@material-ui/core";

import { MEMBER_REUQESTS } from "../../apollo/client/queries";
import GroupAvatar from "./Avatar";
import JoinButton from "./JoinButton";
import { ResourcePaths } from "../../constants/common";
import { GroupSettings, SettingStates } from "../../constants/setting";
import { WHITE } from "../../styles/Shared/theme";
import Messages from "../../utils/messages";
import {
  useCurrentUser,
  useHasPermissionByGroupId,
  useMembersByGroupId,
  useSettingsByGroupId,
} from "../../hooks";
import CompactText from "../Shared/CompactText";
import { noCache, settingValueByName } from "../../utils/clientIndex";
import { GroupPermissions } from "../../constants/role";
import GroupItemMenu from "./ItemMenu";

interface Props {
  group: ClientGroup;
  deleteGroup: (id: string) => void;
}

const Group = ({ group, deleteGroup }: Props) => {
  const { id, name, description } = group;
  const [groupSettings] = useSettingsByGroupId(id);
  const [groupMembers, setGroupMembers] = useMembersByGroupId(group.id);
  const [memberRequests, setMemberRequests] = useState<ClientMemberRequest[]>(
    []
  );
  const currentUser = useCurrentUser();
  const memberVariables = {
    variables: { groupId: group.id },
    ...noCache,
  };
  const memberRequestsRes = useQuery(MEMBER_REUQESTS, memberVariables);
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
    if (memberRequestsRes.data)
      setMemberRequests(memberRequestsRes.data.memberRequests);
  }, [memberRequestsRes.data]);

  const isNoAdmin = (): boolean => {
    return (
      settingValueByName(GroupSettings.NoAdmin, groupSettings) ===
      SettingStates.On
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

  return (
    <div key={id}>
      <Card>
        <CardHeader
          avatar={group && <GroupAvatar group={group} />}
          title={
            <Link href={`${ResourcePaths.Group}${name}`}>
              <a>{name}</a>
            </Link>
          }
          action={
            currentUser &&
            !isNoAdmin() && (
              <GroupItemMenu
                group={group}
                deleteGroup={deleteGroup}
                canEdit={canEdit}
                canDelete={canDelete}
                canManageRoles={canManageRoles}
                canManageSettings={canManageSettings}
              />
            )
          }
        />

        <CardContent>
          {description && (
            <Typography
              style={{
                marginTop: "-12px",
              }}
              gutterBottom
            >
              <CompactText text={description} />
            </Typography>
          )}

          <Link href={`${ResourcePaths.Group}${name}/members`}>
            <a>{Messages.groups.members(groupMembers.length)}</a>
          </Link>

          {canSeeRequests() && (
            <>
              <span style={{ color: WHITE }}>
                {Messages.middotWithSpaces()}
              </span>

              <Link href={`${ResourcePaths.Group}${name}/requests`}>
                <a>{Messages.groups.requests(memberRequests.length)}</a>
              </Link>
            </>
          )}
        </CardContent>

        {currentUser && (
          <CardActions style={{ marginTop: "6px" }}>
            <JoinButton
              group={group}
              memberRequests={memberRequests}
              groupMembers={groupMembers}
              setMemberRequests={setMemberRequests}
              setGroupMembers={setGroupMembers}
            />
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Group;
