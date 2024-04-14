import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import { Typography } from '@mui/material';
import DocsSubheading from '../../components/Docs/DocsSubheading';
import DocsDefinitionListItem from '../../components/Docs/DocsDefinitionListItem';

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  const instanceName = process.env.WEBSITE_URL?.replace(
    /^(https?:\/\/)?(www\.)?/,
    '',
  );

  return (
    <>
      <LevelOneHeading header>
        {t('privacyPolicy.headers.privacyPolicy')}
      </LevelOneHeading>

      <Typography marginBottom={3}>
        This privacy policy describes how {instanceName} collects, protects and
        uses the personally identifiable information you may provide through the
        {' ' + instanceName} website or its API. The policy also describes the
        choices available to you regarding our use of your personal information
        and how you can access and update this information.
      </Typography>

      <DocsSubheading>What information do we collect?</DocsSubheading>

      <DocsDefinitionListItem name="Basic account information">
        If you register on this server, you may be asked to enter a username, an
        e-mail address and a password. You may also enter additional profile
        information such as a biography, a profile picture, and cover photo. The
        username, biography, profile picture, and cover photo are shown publicly
        if the user joins any public groups.
      </DocsDefinitionListItem>

      <DocsDefinitionListItem name="Posts, following and other public information">
        The list of people you follow is visible to other verified users, just
        like your list of followers. Only posts in public groups are accessible
        to the public. Any interactions with these public group posts, such as
        comments, likes, or votes, are also visible to the public. However,
        posts in private groups and user profile posts are only accessible to
        other verified users.
      </DocsDefinitionListItem>
    </>
  );
};

export default PrivacyPolicy;
