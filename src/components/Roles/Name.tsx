import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { ROLE } from "../../apollo/client/queries";
import { noCache } from "../../utils/apollo";
import Messages from "../../utils/messages";

const RoleName = ({ roleId }: { roleId: string }) => {
  const [role, setRole] = useState<ClientRole>();
  const roleRes = useQuery(ROLE, {
    variables: { id: roleId },
    ...noCache,
  });

  useEffect(() => {
    if (roleRes.data) setRole(roleRes.data.role);
  }, [roleRes.data]);

  if (roleRes.loading) return <>{Messages.states.loading()}</>;
  return <span style={{ color: role?.color }}>{role?.name}</span>;
};

export default RoleName;
