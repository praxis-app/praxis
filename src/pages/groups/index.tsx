import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { CircularProgress } from "@material-ui/core";

import Group from "../../components/Groups/Group";
import { GROUPS } from "../../apollo/client/queries";
import { DELETE_GROUP } from "../../apollo/client/mutations";
import GroupForm from "../../components/Groups/Form";

const Index = () => {
  const [groups, setGroups] = useState<Group[]>();
  const [deleteGroup] = useMutation(DELETE_GROUP);
  const { data } = useQuery(GROUPS, {
    fetchPolicy: "no-cache",
  });

  useEffect(() => {
    if (data) setGroups(data.allGroups);
  }, [data]);

  const deleteGroupHandler = async (groupId: string) => {
    try {
      await deleteGroup({
        variables: {
          id: groupId,
        },
      });
      // Removes deleted group from state
      if (groups)
        setGroups(groups.filter((group: Group) => group.id !== groupId));
    } catch {}
  };

  return (
    <>
      <GroupForm groups={groups} setGroups={setGroups} />
      {groups ? (
        groups
          .slice()
          .reverse()
          .map((group: Group) => {
            return (
              <Group
                group={group}
                deleteGroup={deleteGroupHandler}
                key={group.id}
              />
            );
          })
      ) : (
        <CircularProgress style={{ color: "white" }} />
      )}
    </>
  );
};

export default Index;
