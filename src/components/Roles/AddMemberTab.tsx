import React, { useState, useEffect } from "react";
import { useMutation } from "@apollo/client";
import { Card, CircularProgress } from "@material-ui/core";
import { AddCircle, ArrowForwardIos } from "@material-ui/icons";

import { ADD_ROLE_MEMBERS } from "../../apollo/client/mutations";
import styles from "../../styles/Role/AddMemberTab.module.scss";
import Modal from "../Shared/Modal";
import Messages from "../../utils/messages";
import RoleMemberAdd from "./MemberAdd";
import RoleMember from "./Member";
import { useAllUsers, useMembersByGroupId } from "../../hooks";
import { errorToast } from "../../utils/clientIndex";

interface Props {
  role: ClientRole;
  roleMembers: ClientRoleMember[];
  setRoleMembers: (members: ClientRoleMember[]) => void;
  membersLoading: boolean;
  group?: ClientGroup;
}

const AddMemberTab = ({
  role,
  roleMembers,
  setRoleMembers,
  membersLoading,
  group,
}: Props) => {
  const [users, _setUsers, usersLoading] = useAllUsers(!group);
  const [groupMembers, _setGroupMembers, groupMembersLoading] =
    useMembersByGroupId(group?.id);
  const [selectedUsers, setSelectedUsers] = useState<SelectedUser[]>([]);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [addMembersLoading, setAddMembersLoading] = useState<boolean>(false);
  const [addRoleMembers] = useMutation(ADD_ROLE_MEMBERS);

  useEffect(() => {
    setSelectedUsers([]);
  }, [dialogOpen]);

  const addRoleMembersHandler = async () => {
    setAddMembersLoading(true);
    try {
      const {
        data: {
          addRoleMembers: { roleMembers: newRoleMembers },
        },
      } = await addRoleMembers({
        variables: {
          roleId: role.id,
          selectedUsers: selectedUsers.map(({ userId }) => {
            return { userId };
          }),
        },
      });
      setRoleMembers([...roleMembers, ...newRoleMembers]);
      setDialogOpen(false);
    } catch (err) {
      errorToast(err);
    }
    setAddMembersLoading(false);
  };

  if (membersLoading || usersLoading || groupMembersLoading)
    return <CircularProgress />;

  return (
    <>
      <Card className={styles.buttonCard} onClick={() => setDialogOpen(true)}>
        <div className={styles.buttonWrapper}>
          <div className={styles.button}>
            <AddCircle className={styles.addCircleIcon} />
            <div className={styles.buttonText}>
              {Messages.roles.actions.addMembers()}
            </div>
          </div>

          <ArrowForwardIos className={styles.arrowIcon} fontSize="small" />
        </div>
      </Card>

      <Modal
        title={Messages.roles.actions.addMembers()}
        subtext={role.name}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        actionLabel={Messages.actions.add()}
        closingAction={addRoleMembersHandler}
        loading={addMembersLoading}
        appBar
      >
        <Card>
          {group
            ? groupMembers
                .filter((groupMember) => {
                  return !roleMembers.find(
                    (member) => groupMember.userId === member.userId
                  );
                })
                .map((groupMember) => {
                  return (
                    <RoleMemberAdd
                      userId={groupMember.userId}
                      selectedUsers={selectedUsers}
                      setSelectedUsers={setSelectedUsers}
                      key={groupMember.userId}
                    />
                  );
                })
            : users
                .filter((user) => {
                  return !roleMembers.find(
                    (roleMember) => user.id === roleMember.userId
                  );
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
      </Modal>

      <Card>
        {roleMembers.map((roleMember) => {
          return (
            <RoleMember
              member={roleMember}
              members={roleMembers}
              setMembers={setRoleMembers}
              key={roleMember.id}
            />
          );
        })}
      </Card>
    </>
  );
};

export default AddMemberTab;
