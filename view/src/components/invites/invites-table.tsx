import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { type InviteRes } from '@/types/invite.types';
import { useTranslation } from 'react-i18next';
import { InviteTableRow } from './invite-table-row';

interface Props {
  invites: InviteRes[];
}

export const InvitesTable = ({ invites }: Props) => {
  const { t } = useTranslation();

  return (
    <Card className="w-full max-w-md py-3">
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('invites.columnNames.inviter')}</TableHead>
              <TableHead>{t('invites.columnNames.code')}</TableHead>
              <TableHead>{t('invites.columnNames.uses')}</TableHead>
              <TableHead>{t('invites.columnNames.expires')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invites.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="pt-8 pb-4 text-center">
                  {t('invites.prompts.noInvites')}
                </TableCell>
              </TableRow>
            ) : (
              invites.map((invite) => (
                <InviteTableRow key={invite.id} invite={invite} />
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
