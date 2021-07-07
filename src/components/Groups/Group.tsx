import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { Settings } from "@material-ui/icons";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  CardHeader,
  MenuItem,
} from "@material-ui/core";

import { MEMBER_REUQESTS } from "../../apollo/client/queries";
import GroupAvatar from "./Avatar";
import JoinButton from "./JoinButton";
import ItemMenu from "../Shared/ItemMenu";
import { Common, Settings as SettingsConstants } from "../../constants";
import Messages from "../../utils/messages";
import { noCache } from "../../utils/apollo";
import {
  useCurrentUser,
  useMembersByGroupId,
  useSettingsByGroupId,
} from "../../hooks";

interface Props {
  group: Group;
  deleteGroup: (id: string) => void;
}

const Group = ({ group, deleteGroup }: Props) => {
  const { id, name, description, creatorId } = group;
  const [groupSettings] = useSettingsByGroupId(id);
  const [groupMembers, setGroupMembers] = useMembersByGroupId(group.id);
  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const currentUser = useCurrentUser();
  const memberVariables = {
    variables: { groupId: group.id },
    ...noCache,
  };
  const memberRequestsRes = useQuery(MEMBER_REUQESTS, memberVariables);

  useEffect(() => {
    if (memberRequestsRes.data)
      setMemberRequests(memberRequestsRes.data.memberRequests);
  }, [memberRequestsRes.data]);

  const isCreator = (): boolean => {
    if (currentUser) return currentUser.id === creatorId;
    return false;
  };

  const settingByName = (name: string): string => {
    const setting = groupSettings.find((setting) => setting.name === name);
    return setting?.value || "";
  };

  const isNoAdmin = (): boolean => {
    return (
      settingByName(SettingsConstants.GroupSettings.NoAdmin) ===
      SettingsConstants.States.On
    );
  };

  const isAMember = (): boolean => {
    const member = groupMembers?.find(
      (member: GroupMember) => member.userId === currentUser?.id
    );
    return !!member;
  };

  const canSeeRequests = (): boolean => {
    if (isCreator()) return true;
    if (isNoAdmin() && isAMember()) return true;
    return false;
  };

  return (
    <div key={id}>
      <Card>
        <CardHeader
          avatar={group && <GroupAvatar group={group} />}
          title={
            <Link href={`/groups/${name}`}>
              <a>{name}</a>
            </Link>
          }
          action={
            currentUser &&
            !isNoAdmin() && (
              <ItemMenu
                itemId={id}
                name={group.name}
                itemType={Common.ModelNames.Group}
                anchorEl={menuAnchorEl}
                setAnchorEl={setMenuAnchorEl}
                deleteItem={deleteGroup}
                ownItem={() => isCreator()}
              >
                <Link href={`/groups/${group.name}/settings`}>
                  <a>
                    <MenuItem>
                      <Settings
                        fontSize="small"
                        style={{
                          marginRight: "5",
                        }}
                      />
                      {Messages.groups.settings.name()}
                    </MenuItem>
                  </a>
                </Link>
              </ItemMenu>
            )
          }
        />

        {description && (
          <CardContent>
            <Typography
              style={{
                marginTop: "-12px",
              }}
              gutterBottom
            >
              {description}
            </Typography>

            <Link href={`/groups/${name}/members`}>
              <a>{Messages.groups.members(groupMembers.length)}</a>
            </Link>

            {canSeeRequests() && (
              <>
                <span style={{ color: "white" }}>
                  {Messages.middotWithSpaces()}
                </span>

                <Link href={`/groups/${name}/requests`}>
                  <a>{Messages.groups.requests(memberRequests.length)}</a>
                </Link>
              </>
            )}
          </CardContent>
        )}

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
