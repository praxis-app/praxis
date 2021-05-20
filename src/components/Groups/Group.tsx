import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { Settings } from "@material-ui/icons";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  makeStyles,
  CardHeader,
  MenuItem,
} from "@material-ui/core";

import { isLoggedIn } from "../../utils/auth";
import {
  CURRENT_USER,
  GROUP_MEMBERS,
  MEMBER_REUQESTS,
  SETTINGS_BY_GROUP_ID,
} from "../../apollo/client/queries";
import styles from "../../styles/Group/Group.module.scss";
import GroupAvatar from "./Avatar";
import JoinButton from "./JoinButton";
import ItemMenu from "../Shared/ItemMenu";
import { Settings as SettingsConstants } from "../../constants";

const useStyles = makeStyles({
  root: {
    backgroundColor: "rgb(65, 65, 65)",
  },
  title: {
    fontFamily: "Inter",
  },
});

interface Props {
  group: Group;
  deleteGroup: (id: string) => void;
}

const Group = ({ group, deleteGroup }: Props) => {
  const { id, name, description, creatorId } = group;
  const [currentUser, setCurrentUser] = useState<CurrentUser>();
  const [groupSettings, setGroupSettings] = useState<Setting[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([]);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const noCache: {} = {
    fetchPolicy: "no-cache",
  };
  const memberVariables: {} = {
    variables: { groupId: group.id },
    ...noCache,
  };
  const groupMembersRes = useQuery(GROUP_MEMBERS, memberVariables);
  const memberRequestsRes = useQuery(MEMBER_REUQESTS, memberVariables);
  const groupSettingsRes = useQuery(SETTINGS_BY_GROUP_ID, {
    variables: { groupId: id },
    ...noCache,
  });
  const currentUserRes = useQuery(CURRENT_USER);
  const classes = useStyles();

  useEffect(() => {
    if (currentUserRes.data) setCurrentUser(currentUserRes.data.user);
  }, [currentUserRes.data]);

  useEffect(() => {
    if (groupMembersRes.data)
      setGroupMembers(groupMembersRes.data.groupMembers);
  }, [groupMembersRes.data]);

  useEffect(() => {
    if (memberRequestsRes.data)
      setMemberRequests(memberRequestsRes.data.memberRequests);
  }, [memberRequestsRes.data]);

  useEffect(() => {
    if (groupSettingsRes.data)
      setGroupSettings(groupSettingsRes.data.settingsByGroupId);
  }, [groupSettingsRes.data]);

  const isCreator = (): boolean => {
    if (isLoggedIn(currentUser)) return currentUser?.id === creatorId;
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
      <Card className={classes.root + " " + styles.card}>
        <CardHeader
          avatar={group && <GroupAvatar group={group} />}
          title={
            <Link href={`/groups/${name}`}>
              <a>{name}</a>
            </Link>
          }
          action={
            isLoggedIn(currentUser) &&
            !isNoAdmin() && (
              <ItemMenu
                itemId={id}
                name={group.name}
                itemType={"group"}
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
                      Settings
                    </MenuItem>
                  </a>
                </Link>
              </ItemMenu>
            )
          }
          classes={{ title: classes.title }}
        />

        {description && (
          <CardContent>
            <Typography
              style={{
                color: "rgb(190, 190, 190)",
                marginTop: "-12px",
                marginBottom: "24px",
                fontFamily: "Inter",
              }}
            >
              {description}
            </Typography>

            <Link href={`/groups/${name}/members`}>
              <a>{groupMembers.length} Members</a>
            </Link>

            {canSeeRequests() && (
              <>
                <span style={{ color: "white" }}> · </span>

                <Link href={`/groups/${name}/requests`}>
                  <a>{memberRequests.length} Requests</a>
                </Link>
              </>
            )}
          </CardContent>
        )}

        {isLoggedIn(currentUser) && (
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
