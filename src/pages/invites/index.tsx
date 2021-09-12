import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  CircularProgress,
  Card,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableBody,
} from "@material-ui/core";

import { SERVER_INVITES } from "../../apollo/client/queries";
import { noCache } from "../../utils/apollo";
import Messages from "../../utils/messages";
import ServerInvite from "../../components/ServerInvites/ServerInvite";
import TableCell from "../../components/Shared/TableCell";
import ServerInviteForm from "../../components/ServerInvites/Form";
import { useCurrentUser, useHasPermissionGlobally } from "../../hooks";
import { Permissions } from "../../constants/role";

const Index = () => {
  const currentUser = useCurrentUser();
  const [invites, setInvites] = useState<ClientServerInvite[]>([]);
  const invitesRes = useQuery(SERVER_INVITES, noCache);
  const [canManageInvites, canManageInvitesLoading] = useHasPermissionGlobally(
    Permissions.ManageInvites
  );
  const [canCreateInvites, canCreateInvitesLoading] = useHasPermissionGlobally(
    Permissions.CreateInvites
  );

  useEffect(() => {
    if (invitesRes.data)
      setInvites(
        invitesRes.data.allServerInvites.filter(
          (invite: ClientServerInvite) =>
            canManageInvites || invite.userId === currentUser?.id
        )
      );
  }, [invitesRes.data, canManageInvites, currentUser]);

  if (invitesRes.loading || canManageInvitesLoading || canCreateInvitesLoading)
    return <CircularProgress />;

  if (!canManageInvites && !canCreateInvites)
    return <>{Messages.users.permissionDenied()}</>;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        {Messages.invites.labels.serverInvites()}
      </Typography>

      {canCreateInvites && (
        <ServerInviteForm invites={invites} setInvites={setInvites} />
      )}

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{Messages.invites.columnNames.inviter()}</TableCell>
              <TableCell>{Messages.invites.columnNames.code()}</TableCell>
              <TableCell>{Messages.invites.columnNames.uses()}</TableCell>
              <TableCell>{Messages.invites.columnNames.expires()}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {invites
              .slice()
              .reverse()
              .map((invite: ClientServerInvite) => {
                return (
                  <ServerInvite
                    invite={invite}
                    invites={invites}
                    setInvites={setInvites}
                    key={invite.id}
                  />
                );
              })}
          </TableBody>
        </Table>
      </Card>
    </>
  );
};

export default Index;
