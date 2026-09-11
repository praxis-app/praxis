import { api } from '@/client/api-client';
import { TopNav } from '@/components/nav/top-nav';
import { PollSettingsForm } from '@/components/settings/poll-settings-form';
import { Card, CardContent } from '@/components/ui/card';
import { Container } from '@/components/ui/container';
import { NavigationPaths } from '@/constants/shared.constants';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useServerData } from '../../hooks/use-server-data';

export const PollSettings = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { serverId, serverPath } = useServerData();

  const { data, isPending, error } = useQuery({
    queryKey: ['servers', serverId, 'configs'],
    queryFn: () => {
      if (!serverId) {
        throw new Error('Server ID is required');
      }
      return api.getServerConfig(serverId);
    },
    enabled: !!serverId,
  });

  if (error) {
    return <p>{t('errors.somethingWentWrong')}</p>;
  }

  if (isPending) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('navigation.labels.proposals')}
        subheader={t('navigation.subheaders.serverSettings')}
        subheaderAboveHeader
        onBackClick={() => navigate(`${serverPath}${NavigationPaths.Settings}`)}
      />

      <Container>
        <Card>
          <CardContent>
            <PollSettingsForm serverConfig={data.serverConfig} />
          </CardContent>
        </Card>
      </Container>
    </>
  );
};
