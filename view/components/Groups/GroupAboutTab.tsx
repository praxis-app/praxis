import { Card, CardContent, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GroupAdminModel, GroupPrivacy } from '../../constants/group.constants';
import { VotingTimeLimit } from '../../constants/proposal.constants';
import { useGroupAboutTabQuery } from '../../graphql/groups/queries/gen/GroupAboutTab.gen';
import { urlifyText } from '../../utils/shared.utils';
import Setting from '../Settings/Setting';
import Flex from '../Shared/Flex';
import FormattedText from '../Shared/FormattedText';
import ProgressBar from '../Shared/ProgressBar';

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
    if (settings.decisionMakingModel === 'Consent') {
      return t('groups.labels.consent');
    }
    if (settings.decisionMakingModel === 'MajorityVote') {
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

          <FormattedText
            text={description || t('groups.prompts.noAboutText')}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t('groups.labels.settings')}
          </Typography>

          <Flex flexDirection="column" gap={3}>
            <Setting
              name={t('groups.settings.names.adminModel')}
              description={t('groups.settings.explanations.adminModel')}
              value={getAdminModel()}
            />

            <Setting
              name={t('groups.settings.names.decisionMakingModel')}
              description={t(
                'groups.settings.explanations.decisionMakingModel',
              )}
              value={getDecisionMakingModel()}
            />

            <Setting
              name={t('groups.settings.names.standAsidesLimit')}
              description={t('groups.settings.explanations.standAsidesLimit')}
              value={settings.standAsidesLimit}
            />

            <Setting
              name={t('groups.settings.names.reservationsLimit')}
              description={t('groups.settings.explanations.reservationsLimit')}
              value={settings.reservationsLimit}
            />

            <Setting
              name={t('groups.settings.names.ratificationThreshold')}
              description={t(
                'groups.settings.explanations.ratificationThreshold',
              )}
              value={`${settings.ratificationThreshold}%`}
            />

            <Setting
              name={t('groups.settings.names.votingTimeLimit')}
              description={t('groups.settings.explanations.votingTimeLimit')}
              value={getVotingTimeLimit()}
            />

            <Setting
              name={t('groups.settings.names.privacy')}
              description={t('groups.settings.explanations.privacy')}
              value={getPrivacy()}
              divider={false}
            />
          </Flex>
        </CardContent>
      </Card>
    </>
  );
};

export default GroupAboutTab;
