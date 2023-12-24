import { Card, Table, TableBody, TableHead, TableRow } from '@mui/material';
import { useTranslation } from 'react-i18next';
import ServerInviteRow from '../../components/ServerInvites/ServerInviteRow';
import { ServerInviteCardFragment } from '../../graphql/invites/fragments/gen/ServerInviteCard.gen';
import { ServerInvitesQuery } from '../../graphql/invites/queries/gen/ServerInvites.gen';
import TableCell from '../Shared/TableCell';

interface Props {
  serverInvites: ServerInviteCardFragment[];
  me: ServerInvitesQuery['me'];
}

const ServerInviteTable = ({ serverInvites, me }: Props) => {
  const { t } = useTranslation();
  return (
    <Card>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>{t('invites.columnNames.inviter')}</TableCell>
            <TableCell>{t('invites.columnNames.code')}</TableCell>
            <TableCell>{t('invites.columnNames.uses')}</TableCell>
            <TableCell>{t('invites.columnNames.expires')}</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {serverInvites.map((serverInvite) => (
            <ServerInviteRow
              key={serverInvite.id}
              serverInvite={serverInvite}
              me={me}
            />
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ServerInviteTable;
