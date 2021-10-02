import { ChangeEvent } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  LinearProgress,
  Typography,
} from "@material-ui/core";
import { AccountCircle, ExpandMore } from "@material-ui/icons";
import { useMembersByRoleId, usePermissionsByRoleId } from "../../hooks";
import { permissionDisplayName } from "../../utils/clientIndex";
import Messages from "../../utils/messages";
import UserName from "../Users/Name";

interface Props {
  role: ClientRole;
  expanded: string | false;
  handleClick: (
    roleId: string
  ) => (event: ChangeEvent<any>, expanded: boolean) => void;
}

const RoleCompact = ({ role, expanded, handleClick }: Props) => {
  const { id, name, color } = role;
  const [permissions, _setPermissions, permissionsLoading] =
    usePermissionsByRoleId(id, Boolean(expanded));
  const [members, _setMembers, membersLoading] = useMembersByRoleId(
    id,
    Boolean(expanded)
  );
  const enabledPermissions = permissions.filter(({ enabled }) => enabled);

  return (
    <Accordion expanded={expanded === id} onChange={handleClick(id)}>
      <AccordionSummary expandIcon={<ExpandMore color="primary" />}>
        <Typography style={{ color }}>
          <AccountCircle style={{ marginBottom: -6 }} />
          {" " + name}
        </Typography>
      </AccordionSummary>
      <AccordionDetails style={{ display: "block" }}>
        {membersLoading || permissionsLoading ? (
          <LinearProgress />
        ) : (
          <>
            {Boolean(members.length) && (
              <>
                <Typography>{Messages.roles.tabs.members()}</Typography>
                {members.map(({ id, userId }) => (
                  <Typography key={id}>
                    • <UserName userId={userId} />
                  </Typography>
                ))}
              </>
            )}

            {Boolean(enabledPermissions.length && members.length) && (
              <div style={{ height: 12 }}></div>
            )}

            {Boolean(enabledPermissions.length) && (
              <>
                <Typography>{Messages.roles.tabs.permissions()}</Typography>
                {enabledPermissions.map(({ name }) => (
                  <Typography key={name}>{`• ${permissionDisplayName(
                    name
                  )}`}</Typography>
                ))}
              </>
            )}

            {!enabledPermissions.length && !members.length && (
              <Typography>{Messages.roles.noMembersOrPermissions()}</Typography>
            )}
          </>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export default RoleCompact;
