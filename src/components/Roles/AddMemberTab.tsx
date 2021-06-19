import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Card, CircularProgress, makeStyles } from "@material-ui/core";
import { AddCircle, ArrowForwardIos } from "@material-ui/icons";

import { USERS } from "../../apollo/client/queries";
import { ADD_ROLE_MEMBERS } from "../../apollo/client/mutations";
import { noCache } from "../../utils/apollo";
import styles from "../../styles/Role/AddMemberTab.module.scss";
import Dialog from "../../components/Shared/Dialog";
import Messages from "../../utils/messages";
import RoleMemberAdd from "./MemberAdd";
import RoleMember from "./Member";

const useStyles = makeStyles({
  root: {
    backgroundColor: "rgb(65, 65, 65)",
  },
});

interface Props {
  role: Role;
  members: RoleMember[];
  setMembers: (members: RoleMember[]) => void;
  membersLoading: boolean;
}

const AddMemberTab = ({ role, members, setMembers, membersLoading }: Props) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [addMembersDialogOpen, setAddMembersDialogOpen] =
    useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [addRoleMembers] = useMutation(ADD_ROLE_MEMBERS);
  const usersRes = useQuery(USERS, noCache);
  const classes = useStyles();

  useEffect(() => {
    setSelectedUsers([]);
  }, [addMembersDialogOpen]);

  useEffect(() => {
    if (usersRes.data) setUsers(usersRes.data.allUsers);
  }, [usersRes.data]);

  const addRoleMembersHandler = async () => {
    setLoading(true);
    try {
      const { data } = await addRoleMembers({
        variables: {
          roleId: role.id,
          selectedUsers: selectedUsers.map(({ userId }) => {
            return { userId };
          }),
        },
      });
      const newMembers = data.addRoleMembers.roleMembers;
      setMembers([...members, ...newMembers]);
      setAddMembersDialogOpen(false);
    } catch (err) {
      alert(err);
    }
    setLoading(false);
  };

  if (role && !membersLoading)
    return (
      <>
        <Card
          className={classes.root + " " + styles.buttonCard}
          onClick={() => setAddMembersDialogOpen(true)}
        >
          <div className={styles.buttonWrapper}>
            <div className={styles.button}>
              <AddCircle className={styles.addCircleIcon} fontSize="small" />
              <div className={styles.buttonText}>
                {Messages.roles.actions.addMembers()}
              </div>
            </div>

            <ArrowForwardIos className={styles.arrowIcon} fontSize="small" />
          </div>
        </Card>

        <Dialog
          title={Messages.roles.actions.addMembers()}
          subtext={role.name}
          open={addMembersDialogOpen}
          setOpen={setAddMembersDialogOpen}
          actionLabel={Messages.actions.add()}
          closingAction={addRoleMembersHandler}
          loading={loading}
        >
          <Card className={classes.root + " " + styles.card}>
            {users
              .filter((user) => {
                return !members.find((member) => user.id === member.userId);
              })
              .map((user) => {
                return (
                  <RoleMemberAdd
                    userId={user.id}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    key={user.id}
                  />
                );
              })}
          </Card>
        </Dialog>

        <Card className={classes.root + " " + styles.card}>
          {members.map((member) => {
            return (
              <RoleMember
                member={member}
                members={members}
                setMembers={setMembers}
                key={member.id}
              />
            );
          })}
        </Card>
      </>
    );

  return <CircularProgress style={{ color: "white" }} />;
};

export default AddMemberTab;
