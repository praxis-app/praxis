// TODO: Move text to en.json once privacy policy is finalized

import { useTranslation } from 'react-i18next';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import { Box, Typography } from '@mui/material';
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

      <Box component="ul" paddingLeft={3} marginBottom={3}>
        <DocsDefinitionListItem name="Basic account information">
          If you register on this server, you may be asked to enter a username,
          an e-mail address and a password. You may also enter additional
          profile information such as a biography, a profile picture, and cover
          photo. The username, biography, profile picture, and cover photo are
          shown publicly if the user joins any public groups.
        </DocsDefinitionListItem>

        <DocsDefinitionListItem name="Posts, following and other public information">
          The list of people you follow is visible to other verified users, just
          like your list of followers. Only posts in public groups are
          accessible to the public. Any interactions with these public group
          posts, such as comments, likes, or votes, are also visible to the
          public. However, posts in private groups and user profile posts are
          only accessible to other verified users.
        </DocsDefinitionListItem>
      </Box>

      <DocsSubheading>What do we use your information for?</DocsSubheading>

      <Typography marginBottom={1.5}>
        Any of the information we collect from you may be used in the following
        ways:
      </Typography>

      <Box component="ul" paddingLeft={3} marginBottom={1.5}>
        <DocsDefinitionListItem>
          To provide the core functionality of Praxis. You can only interact
          with other people's content and post your own content when you are
          logged in. For example, you may follow other people to view their
          combined posts in your own personalized home timeline.
        </DocsDefinitionListItem>

        <DocsDefinitionListItem>
          The email address you provide may be used to send you information,
          notifications about other people interacting with your content,
          password resets, or to respond to inquiries.
        </DocsDefinitionListItem>
      </Box>

      <DocsSubheading>How do we protect your information?</DocsSubheading>

      <Typography marginBottom={3}>
        We implement a variety of security measures to maintain the safety of
        your personal information when you enter, submit, or access your
        personal information. Among other things, your browser session, as well
        as the traffic between your applications and the API, are secured with
        SSL, and your password is hashed using a strong one-way algorithm.
      </Typography>

      <DocsSubheading>
        Do we disclose any information to outside parties?
      </DocsSubheading>

      <Typography marginBottom={3}>
        We do not sell, trade, or otherwise transfer to outside parties your
        personally identifiable information. This does not include trusted third
        parties who assist us in operating our site or servicing you, so long as
        those parties agree to keep this information confidential. We may also
        release your information when we believe it is necessary to enforce our
        site policies or to protect our rights, the rights of others, or safety.
      </Typography>

      <DocsSubheading>Site usage by children</DocsSubheading>

      <Typography marginBottom={3}>
        Usage of our site, products, and services is strictly limited to
        individuals who are 18 years of age or older. If you are under the age
        of 18, please do not use this site.
      </Typography>

      <DocsSubheading>Work in progress</DocsSubheading>

      <Typography marginBottom={3}>
        This privacy policy is subject to change as the project is still in its
        early stages. If you have any questions or feedback regarding the
        policy, please contact us at {process.env.MAIL_ADDRESS}. Your feedback
        is greatly appreciated.
      </Typography>
    </>
  );
};

export default PrivacyPolicy;
