import { useEffect, useState } from "react";
import { useLazyQuery, useReactiveVar } from "@apollo/client";
import { LinearProgress } from "@material-ui/core";

import MotionsForm from "./Form";
import Modal from "../Shared/Modal";
import { noCache } from "../../utils/apollo";
import { JOINED_GROUPS_BY_USER_ID } from "../../apollo/client/queries";
import { useCurrentUser } from "../../hooks";
import { modalOpenVar } from "../../apollo/client/localState";
import { ModelNames } from "../../constants/common";

const MotionFormModal = () => {
  const currentUser = useCurrentUser();
  const openFromGlobal = useReactiveVar(modalOpenVar);
  const [open, setOpen] = useState<boolean>(false);
  const [groups, setGroups] = useState<ClientGroup[]>();
  const [getGroupsRes, groupsRes] = useLazyQuery(
    JOINED_GROUPS_BY_USER_ID,
    noCache
  );

  useEffect(() => {
    if (openFromGlobal === ModelNames.Motion) setOpen(true);
    else setOpen(false);
  }, [openFromGlobal]);

  useEffect(() => {
    if (open && currentUser)
      getGroupsRes({ variables: { userId: currentUser.id } });
    else modalOpenVar("");
  }, [open, currentUser]);

  useEffect(() => {
    if (groupsRes.data) setGroups(groupsRes.data.joinedGroupsByUserId);
  }, [groupsRes.data]);

  return (
    <Modal open={open} onClose={() => modalOpenVar("")} appBar>
      {groupsRes.loading ? (
        <LinearProgress />
      ) : (
        <MotionsForm
          closeModal={() => setOpen(false)}
          groups={groups}
          withoutToggle
        />
      )}
    </Modal>
  );
};

export default MotionFormModal;
