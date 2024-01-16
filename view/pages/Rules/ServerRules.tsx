import { Card, CardContent, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import CreateRuleModal from '../../components/Rules/CreateRuleModal';
import Rule from '../../components/Rules/Rule';
import Flex from '../../components/Shared/Flex';
import GhostButton from '../../components/Shared/GhostButton';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useServerRulesQuery } from '../../graphql/rules/queries/gen/ServerRules.gen';

const ServerRules = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { data, loading } = useServerRulesQuery();

  const { t } = useTranslation();

  if (loading) {
    return <ProgressBar />;
  }

  return (
    <>
      <Flex justifyContent="space-between" alignItems="center">
        <LevelOneHeading header>
          {t('rules.headers.serverRules')}
        </LevelOneHeading>

        <GhostButton
          sx={{ marginBottom: 3.5 }}
          onClick={() => setIsCreateModalOpen(true)}
        >
          {t('rules.labels.create')}
        </GhostButton>
      </Flex>

      <Card>
        <CardContent>
          {!data?.serverRules.length && (
            <Typography textAlign="center" paddingTop={2} paddingBottom={1}>
              {t('rules.prompts.noRules')}
            </Typography>
          )}
          {data?.serverRules.map((rule, index) => (
            <Rule
              key={rule.id}
              rule={rule}
              isLast={index + 1 !== data.serverRules.length}
            />
          ))}
        </CardContent>
      </Card>

      <CreateRuleModal
        isOpen={isCreateModalOpen}
        handleCloseModal={() => setIsCreateModalOpen(false)}
      />
    </>
  );
};

export default ServerRules;
