import {
  Card,
  CardContent,
  Table,
  TableBody,
  TableRow,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useGroupAboutTabQuery } from '../../graphql/groups/queries/gen/GroupAboutTab.gen';
import { urlifyText } from '../../utils/shared.utils';
import ProgressBar from '../Shared/ProgressBar';
import { GroupAdminModel, GroupPrivacy } from '../../constants/group.constants';
import {
  DecisionMakingModel,
  VotingTimeLimit,
} from '../../constants/proposal.constants';
import TableCell from '../Shared/TableCell';

interface Props {
  groupId: number;
}

const GroupAboutTab = ({ groupId }: Props) => {
  const { data, loading } = useGroupAboutTabQuery({ variables: { groupId } });
  const { t } = useTranslation();

  if (loading) {
    return <ProgressBar />;
  }

  if (!data) {
    return null;
  }

  const { group } = data;
  const { settings } = group;
  const description = urlifyText(group.description);

  const getAdminModel = () => {
    if (settings.adminModel === GroupAdminModel.NoAdmin) {
      return t('groups.labels.noAdmin');
    }
    if (settings.adminModel === GroupAdminModel.Rotating) {
      return t('groups.labels.rotatingAdmin');
    }
    return t('groups.labels.standard');
  };

  const getDecisionMakingModel = () => {
    if (settings.decisionMakingModel === DecisionMakingModel.Consent) {
      return t('groups.labels.consent');
    }
    if (settings.decisionMakingModel === DecisionMakingModel.MajorityVote) {
      return t('groups.labels.majority');
    }
    return t('groups.labels.consensus');
  };

  const getVotingTimeLimit = () => {
    if (settings.votingTimeLimit === VotingTimeLimit.HalfHour) {
      return t('time.minutesFull', { count: 30 });
    }
    if (settings.votingTimeLimit === VotingTimeLimit.OneHour) {
      return t('time.hoursFull', { count: 1 });
    }
    if (settings.votingTimeLimit === VotingTimeLimit.HalfDay) {
      return t('time.hoursFull', { count: 12 });
    }
    if (settings.votingTimeLimit === VotingTimeLimit.OneDay) {
      return t('time.daysFull', { count: 1 });
    }
    if (settings.votingTimeLimit === VotingTimeLimit.ThreeDays) {
      return t('time.daysFull', { count: 3 });
    }
    if (settings.votingTimeLimit === VotingTimeLimit.OneWeek) {
      return t('time.weeks', { count: 1 });
    }
    if (settings.votingTimeLimit === VotingTimeLimit.TwoWeeks) {
      return t('time.weeks', { count: 2 });
    }
    return t('groups.labels.unlimited');
  };

  const getPrivacy = () => {
    if (settings.privacy === GroupPrivacy.Public) {
      return t('groups.labels.public');
    }
    return t('groups.labels.private');
  };

  return (
    <>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('groups.tabs.about')}
          </Typography>

          <Typography
            dangerouslySetInnerHTML={{
              __html: description || t('groups.prompts.noAboutText'),
            }}
            whiteSpace="pre-wrap"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('groups.labels.settings')}
          </Typography>

          <Table>
            <TableBody>
              <TableRow>
                <TableCell>{t('groups.settings.names.adminModel')}</TableCell>
                <TableCell>{getAdminModel()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('groups.settings.names.decisionMakingModel')}
                </TableCell>
                <TableCell>{getDecisionMakingModel()}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('groups.settings.names.standAsidesLimit')}
                </TableCell>
                <TableCell>{settings.standAsidesLimit}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('groups.settings.names.reservationsLimit')}
                </TableCell>
                <TableCell>{settings.reservationsLimit}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('groups.settings.names.ratificationThreshold')}
                </TableCell>
                <TableCell>{`${settings.ratificationThreshold}%`}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  {t('groups.settings.names.votingTimeLimit')}
                </TableCell>
                <TableCell>{getVotingTimeLimit()}</TableCell>
              </TableRow>
              <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell>{t('groups.settings.names.privacy')}</TableCell>
                <TableCell>{getPrivacy()}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default GroupAboutTab;
