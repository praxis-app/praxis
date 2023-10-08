import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useServerInvitesQuery } from '../../apollo/invites/generated/ServerInvites.query';
import ServerInviteCard from '../../components/ServerInvites/ServerInviteCard';
import ServerInviteForm from '../../components/ServerInvites/ServerInviteForm';
import ServerInviteTable from '../../components/ServerInvites/ServerInviteTable';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import ProgressBar from '../../components/Shared/ProgressBar';
import { useIsDesktop } from '../../hooks/shared.hooks';
import { isDeniedAccess } from '../../utils/error.utils';

const ServerInvites = () => {
  const { data, loading, error } = useServerInvitesQuery();

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  if (isDeniedAccess(error)) {
    return <Typography>{t('prompts.permissionDenied')}</Typography>;
  }

  if (error) {
    return <Typography>{t('errors.somethingWentWrong')}</Typography>;
  }

  if (loading) {
    return <ProgressBar />;
  }

  const renderInvites = () => {
    if (!data || !data.me || !data.serverInvites.length) {
      return null;
    }
    const { me, serverInvites } = data;

    if (isDesktop) {
      return <ServerInviteTable serverInvites={serverInvites} me={me} />;
    }
    return serverInvites.map((invite) => (
      <ServerInviteCard key={invite.id} serverInvite={invite} me={me} />
    ));
  };

  return (
    <>
      <LevelOneHeading header>
        {t('invites.headers.serverInvites')}
      </LevelOneHeading>

      <ServerInviteForm />
      {renderInvites()}
    </>
  );
};

export default ServerInvites;
