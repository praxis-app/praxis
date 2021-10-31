import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CircularProgress, Typography } from "@material-ui/core";

import Group from "../../components/Groups/Group";
import { GROUPS } from "../../apollo/client/queries";
import { DELETE_GROUP } from "../../apollo/client/mutations";
import GroupForm from "../../components/Groups/Form";
import { noCache } from "../../utils/clientIndex";
import Messages from "../../utils/messages";

const Index = () => {
  const [groups, setGroups] = useState<ClientGroup[]>([]);
  const [deleteGroup] = useMutation(DELETE_GROUP);
  const groupsRes = useQuery(GROUPS, noCache);

  useEffect(() => {
    if (groupsRes.data) setGroups(groupsRes.data.allGroups);
  }, [groupsRes.data]);

  const deleteGroupHandler = async (groupId: string) => {
    await deleteGroup({
      variables: {
        id: groupId,
      },
    });
    if (groups)
      setGroups(groups.filter((group: ClientGroup) => group.id !== groupId));
  };

  if (groupsRes.loading) return <CircularProgress />;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {Messages.groups.actions.discover()}
      </Typography>

      <GroupForm />

      {groups.map((group: ClientGroup) => {
        return (
          <Group
            group={group}
            deleteGroup={deleteGroupHandler}
            key={group.id}
          />
        );
      })}
    </>
  );
};

export default Index;
