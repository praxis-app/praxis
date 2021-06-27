import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import {
  CircularProgress,
  Card,
  makeStyles,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableBody,
} from "@material-ui/core";

import { SERVER_INVITES } from "../../apollo/client/queries";
import { noCache } from "../../utils/apollo";
import styles from "../../styles/ServerInvite/ServerInvite.module.scss";
import Messages from "../../utils/messages";
import ServerInvite from "../../components/ServerInvites/ServerInvite";
import TableCell from "../../components/Shared/TableCell";
import ServerInviteForm from "../../components/ServerInvites/Form";
import { useCurrentUser, useHasPermissionGlobally } from "../../hooks";
import { Roles } from "../../constants";

const useStyles = makeStyles({
  root: {
    backgroundColor: "rgb(65, 65, 65)",
  },
});

const Index = () => {
  const currentUser = useCurrentUser();
  const [invites, setInvites] = useState<ServerInvite[]>([]);
  const invitesRes = useQuery(SERVER_INVITES, noCache);
  const [canManageInvites, canManageInvitesLoading] = useHasPermissionGlobally(
    Roles.Permissions.ManageInvites
  );
  const [canCreateInvites, canCreateInvitesLoading] = useHasPermissionGlobally(
    Roles.Permissions.CreateInvites
  );
  const classes = useStyles();

  useEffect(() => {
    if (invitesRes.data)
      setInvites(
        invitesRes.data.allServerInvites.filter(
          (invite: ServerInvite) =>
            canManageInvites || invite.userId === currentUser?.id
        )
      );
  }, [invitesRes.data, canManageInvites, currentUser]);

  if (invitesRes.loading || canManageInvitesLoading || canCreateInvitesLoading)
    return <CircularProgress style={{ color: "white" }} />;

  if (!canManageInvites && !canCreateInvites)
    return <>{Messages.users.permissionDenied()}</>;

  return (
    <>
      <Typography variant="h4" style={{ marginBottom: 24 }}>
        {Messages.invites.labels.serverInvites()}
      </Typography>

      {canCreateInvites && (
        <ServerInviteForm invites={invites} setInvites={setInvites} />
      )}

      <Card className={classes.root + " " + styles.card}>
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
              .map((invite: ServerInvite) => {
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
