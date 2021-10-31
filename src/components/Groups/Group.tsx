import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import {
  Card,
  CardContent,
  Typography,
  CardHeader,
  withStyles,
  createStyles,
  CardActions as MUICardActions,
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
import { noCache, settingValue } from "../../utils/clientIndex";
import { GroupPermissions } from "../../constants/role";
import GroupItemMenu from "./ItemMenu";

const CardActions = withStyles(() =>
  createStyles({
    root: {
      paddingTop: 0,
      paddingLeft: 15,
      paddingBottom: 8,
    },
  })
)(MUICardActions);

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
          style={{ paddingBottom: 0 }}
        />

        <CardContent>
          {description && (
            <Typography style={{ marginBottom: 12 }}>
              <CompactText text={description} />
            </Typography>
          )}

          <Typography>
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
          </Typography>
        </CardContent>

        {currentUser && (
          <CardActions style={{ marginBottom: 6, paddingTop: 0 }}>
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
