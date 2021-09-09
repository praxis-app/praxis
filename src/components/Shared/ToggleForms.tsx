import { useEffect, useState } from "react";
import { useLazyQuery, useReactiveVar } from "@apollo/client";

import { ModelNames } from "../../constants/common";
import { JOINED_GROUPS_BY_USER_ID } from "../../apollo/client/queries";
import { noCache } from "../../utils/clientIndex";
import { useCurrentUser } from "../../hooks";
import { formToggleVar } from "../../apollo/client/localState";
import { Card, CardContent } from "@material-ui/core";
import MotionsForm from "../Motions/Form";
import PostsForm from "../Posts/Form";

interface Props {
  group?: Group;
}

const ToggleForms = ({ group }: Props) => {
  const currentUser = useCurrentUser();
  const toggle = useReactiveVar(formToggleVar);
  const [groups, setGroups] = useState<Group[]>();
  const [getGroupsRes, groupsRes] = useLazyQuery(
    JOINED_GROUPS_BY_USER_ID,
    noCache
  );

  useEffect(() => {
    formToggleVar(ModelNames.Post);
  }, []);

  useEffect(() => {
    if (currentUser && toggle === ModelNames.Motion && !group)
      getGroupsRes({ variables: { userId: currentUser.id } });
  }, [currentUser, toggle, group]);

  useEffect(() => {
    if (groupsRes.data) setGroups(groupsRes.data.joinedGroupsByUserId);
  }, [groupsRes.data]);

  return (
    <Card>
      <CardContent style={{ paddingBottom: 18 }}>
        {toggle === ModelNames.Motion && (
          <MotionsForm
            group={group}
            groups={groups}
            groupsLoading={groupsRes.loading}
          />
        )}

        {toggle === ModelNames.Post && <PostsForm group={group} />}
      </CardContent>
    </Card>
  );
};

export default ToggleForms;
