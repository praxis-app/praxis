import {
  Card,
  TableCell as MuiTableCell,
  Table,
  TableBody,
  TableHead,
  TableRow,
  styled,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import ServerInviteRow from '../../components/ServerInvites/ServerInviteRow';
import { ServerInvitesQuery } from '../../pages/Invites/ServerInvites/generated/ServerInvites.query';
import { ServerInviteCardFragment } from './ServerInviteCard/generated/ServerInviteCard.fragment';

export const TableCell = styled(MuiTableCell)(({ theme }) => ({
  color: theme.palette.text.primary,
  borderColor: theme.palette.divider,
}));

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
