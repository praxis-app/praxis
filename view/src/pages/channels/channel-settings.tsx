import { api } from '@/client/api-client';
import { ChannelSettingsForm } from '@/components/channels/channel-settings-form';
import { TopNav } from '@/components/nav/top-nav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useServerData } from '@/hooks/use-server-data';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { useNavigate, useParams } from 'react-router-dom';

export const ChannelSettings = () => {
  const { channelId } = useParams();
  const { serverId, serverPath } = useServerData();

  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: channelData } = useQuery({
    queryKey: ['servers', serverId, 'channels', channelId],
    queryFn: () => {
      if (!serverId || !channelId) {
        throw new Error('Server ID and channel ID are required');
      }
      return api.getChannel(serverId, channelId);
    },
    enabled: !!channelId && !!serverId,
  });

  const goBack = () => {
    navigate(`${serverPath}/c/${channelId}`);
  };

  if (!channelData?.channel) {
    return null;
  }

  return (
    <>
      <TopNav
        header={t('channels.headers.channelSettings')}
        backBtnIcon={<MdClose className="size-6" />}
        onBackClick={goBack}
        goBackOnEscape
      />

      <div className="flex h-full flex-col items-center justify-center p-4 md:p-18">
        <Card className="w-full max-w-md">
          <CardHeader>
            <VisuallyHidden>
              <CardTitle>{t('channels.headers.channelSettings')}</CardTitle>
            </VisuallyHidden>
            <CardDescription>
              {t('channels.headers.channelSettingsDescription')}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <ChannelSettingsForm
              editChannel={channelData.channel}
              onSuccess={goBack}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
};
