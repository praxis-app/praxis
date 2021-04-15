import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import { Edit, Delete } from "@material-ui/icons";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardActions,
  Typography,
  makeStyles,
  CardHeader,
} from "@material-ui/core";

import { isLoggedIn } from "../../utils/auth";
import {
  CURRENT_USER,
  GROUP_MEMBERS,
  MEMBER_REUQESTS,
} from "../../apollo/client/queries";
import styles from "../../styles/Group/Group.module.scss";
import GroupAvatar from "./Avatar";
import JoinButton from "./JoinButton";

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
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [memberRequests, setMemberRequests] = useState<MemberRequest[]>([]);

  const memberVariables: {} = {
    variables: {
      groupId: group.id,
    },
    fetchPolicy: "no-cache",
  };
  const groupMembersRes = useQuery(GROUP_MEMBERS, memberVariables);
  const memberRequestsRes = useQuery(MEMBER_REUQESTS, memberVariables);
  const currentUserRes = useQuery(CURRENT_USER);

  const classes = useStyles();
  const router = useRouter();

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

  const isCreator = (): boolean => {
    if (isLoggedIn(currentUser)) return currentUser?.id === creatorId;
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
            currentUser &&
            group && (
              <JoinButton
                group={group}
                memberRequests={memberRequests}
                groupMembers={groupMembers}
                setMemberRequests={setMemberRequests}
                setGroupMembers={setGroupMembers}
              />
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

            {isCreator() && (
              <>
                <span style={{ color: "white" }}> · </span>

                <Link href={`/groups/${name}/requests`}>
                  <a>{memberRequests.length} Requests</a>
                </Link>
              </>
            )}
          </CardContent>
        )}

        {isCreator() && (
          <CardActions style={{ marginTop: "6px" }}>
            <Link href={`/groups/${name}/edit`}>
              <a>
                <Edit /> Edit
              </a>
            </Link>

            <Link href={router.asPath}>
              <a
                onClick={() =>
                  window.confirm(
                    "Are you sure you want to delete this group?"
                  ) && deleteGroup(id)
                }
              >
                <Delete /> Delete
              </a>
            </Link>
          </CardActions>
        )}
      </Card>
    </div>
  );
};

export default Group;
