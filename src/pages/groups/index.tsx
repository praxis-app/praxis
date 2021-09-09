import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { Card, LinearProgress, Typography } from "@material-ui/core";

import Group from "../../components/Groups/Group";
import { GROUPS } from "../../apollo/client/queries";
import { DELETE_GROUP } from "../../apollo/client/mutations";
import GroupForm from "../../components/Groups/Form";
import Messages from "../../utils/messages";

const Index = () => {
  const [groups, setGroups] = useState<ClientGroup[]>();
  const [deleteGroup] = useMutation(DELETE_GROUP);
  const { data } = useQuery(GROUPS, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (data) setGroups(data.allGroups);
  }, [data]);

  const deleteGroupHandler = async (groupId: string) => {
    await deleteGroup({
      variables: {
        id: groupId,
      },
    });
    if (groups)
      setGroups(groups.filter((group: ClientGroup) => group.id !== groupId));
  };

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {Messages.navigation.groups()}
      </Typography>

      <GroupForm />

      {groups ? (
        groups
          .slice()
          .reverse()
          .map((group: ClientGroup) => {
            return (
              <Group
                group={group}
                deleteGroup={deleteGroupHandler}
                key={group.id}
              />
            );
          })
      ) : (
        <Card>
          <LinearProgress />
        </Card>
      )}
    </>
  );
};

export default Index;
