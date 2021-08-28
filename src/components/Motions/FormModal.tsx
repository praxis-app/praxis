import { useEffect, useState } from "react";
import { useLazyQuery } from "@apollo/client";

import MotionsForm from "./Form";
import Modal from "../Shared/Modal";
import { noCache } from "../../utils/apollo";
import { JOINED_GROUPS_BY_USER_ID } from "../../apollo/client/queries";
import { LinearProgress } from "@material-ui/core";

interface Props {
  userId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const MotionFormModal = ({ open, setOpen, userId }: Props) => {
  const [groups, setGroups] = useState<Group[]>();
  const [getGroupsRes, groupsRes] = useLazyQuery(
    JOINED_GROUPS_BY_USER_ID,
    noCache
  );

  useEffect(() => {
    if (open) getGroupsRes({ variables: { userId } });
  }, [open]);

  useEffect(() => {
    if (groupsRes.data) setGroups(groupsRes.data.joinedGroupsByUserId);
  }, [groupsRes.data]);

  return (
    <Modal open={open} setOpen={setOpen} appBar>
      <>
        {groupsRes.loading && <LinearProgress />}

        {groups && (
          <MotionsForm closeModal={() => setOpen(false)} groups={groups} />
        )}
      </>
    </Modal>
  );
};

export default MotionFormModal;
