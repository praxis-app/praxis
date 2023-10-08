// TODO: Move text to en.json once documentation is finalized

import { Box, Typography } from '@mui/material';
import roleChangeProposal from '../../assets/images/role-change-proposal.png';
import DocsDefinitionListItem from '../../components/Docs/DocsDefinitionListItem';
import DocsLink from '../../components/Docs/DocsLink';
import DocsPermissionList from '../../components/Docs/DocsPermissionList';
import DocsSubheading from '../../components/Docs/DocsSubheading';
import LevelOneHeading from '../../components/Shared/LevelOneHeading';
import { NavigationPaths } from '../../constants/shared.constants';
import { useIsDesktop } from '../../hooks/shared.hooks';

const DocsHomePage = () => {
  const isDesktop = useIsDesktop();

  return (
    <Box marginBottom={15} marginTop={isDesktop ? 0 : 1}>
      <LevelOneHeading header>What is Praxis?</LevelOneHeading>

      <Typography marginBottom={3}>
        Welcome to the Praxis documentation! This page will give you a brief
        overview of Praxis and how it works.
      </Typography>

      <DocsSubheading>Overview</DocsSubheading>

      <Typography marginBottom={1.5}>
        Praxis is a social networking platform with features for collaborative
        decision making.
      </Typography>

      <Typography marginBottom={1.5}>
        Unlike most social networks, Praxis is specifically designed to
        facilitate collective decision making and the building of social
        structures that make sense for the organizations and communities that
        use it.
      </Typography>

      <Typography marginBottom={3}>
        Praxis is free software released under the
        <DocsLink
          href="https://github.com/praxis-app/praxis-ui/blob/main/LICENSE"
          text="GNU General Public License v3.0"
          external
        />
        .
      </Typography>

      <DocsSubheading>Proposals</DocsSubheading>

      <Typography marginBottom={1.5}>
        At the core of Praxis are proposals and voting. Proposals are the basic
        unit of decision making in Praxis. Proposals can be created by any
        member of a group and can be voted on by any group member. Proposals can
        be used to make decisions about anything the group wants to decide on.
      </Typography>

      <Box margin="0 auto" paddingBottom={2.5} paddingTop={1} width="90%">
        <Box
          alt="Role Change Proposal"
          component="img"
          width="100%"
          height="auto"
          src={roleChangeProposal}
          sx={{ objectFit: 'cover' }}
        />

        <Typography
          color="text.secondary"
          marginTop={isDesktop ? -0.5 : 0}
          textAlign="center"
        >
          Proposal to change a group role
        </Typography>
      </Box>

      <Typography marginBottom={1.5}>
        Praxis uses
        <DocsLink
          href="https://seedsforchange.org.uk/consensus"
          text="Model of Consensus"
          external
        />{' '}
        as it's default voting model, drawing inspiration from the principles
        outlined in
        <DocsLink
          href="https://www.seedsforchange.org.uk/handbookweb.pdf"
          text={'"A Consensus Handbook"'}
          external
        />{' '}
        by Seeds for Change. For a proposal to be ratified, it must reach a
        certain threshold of positive votes, with no blocks, as it only takes
        one block to stop a proposal from passing.
      </Typography>

      <Typography marginBottom={1.5}>The different vote types are:</Typography>

      <Box component="ul" paddingLeft={3} marginBottom={1.5}>
        <DocsDefinitionListItem name="Agreement">
          You support the proposal and are willing to help implement it.
        </DocsDefinitionListItem>

        <DocsDefinitionListItem name="Agree with reservations">
          You're willing to let the proposal go ahead but want to make the group
          aware you aren't happy with it. You may even put energy into
          implementing it once your concerns have been addressed. Reservations
          should be fully articulated.
        </DocsDefinitionListItem>

        <DocsDefinitionListItem name="Stand aside">
          You want to object, but not block the proposal. This means you won't
          help to implement the decision, but you are willing for the group to
          go ahead with it.
        </DocsDefinitionListItem>

        <DocsDefinitionListItem name="Block">
          A block always stops a proposal from going ahead. It expresses a
          fundamental objection and that consent has been revoked. It isn't "I
          don't really like it," or "I liked the other idea better."
        </DocsDefinitionListItem>
      </Box>

      <Typography marginBottom={3}>
        Once a proposal reaches enough votes to pass, it's immediately marked as
        ratified. Depending on the proposal type, proposals will automatically
        implement themselves upon ratification. Roles and permissions changes,
        for instance, are implemented as soon as their respective proposal
        passes.
      </Typography>

      <DocsSubheading>Groups</DocsSubheading>

      <Typography marginBottom={1.5}>
        Almost everything in Praxis is scoped to
        <DocsLink href={NavigationPaths.Groups} text="groups" />, including both
        proposals and events. Groups can be public or private, and can be used
        to organize anything from small projects to entire communities.
      </Typography>

      <Typography marginBottom={3}>
        Every group has its own set of roles and permissions, as well as other
        settings that can all be configured directly by group members via
        proposals and voting, or by the groups admins. It's up to every group to
        decide the best way to organize themselves.
      </Typography>

      <DocsSubheading>Roles & Permissions</DocsSubheading>

      <Typography marginBottom={1.5}>
        Roles and permissions are a core part of Praxis. They exist at both the
        group and server level, and can be used to manage who can do what
        throughout the platform.
      </Typography>

      <Typography marginBottom={1.5}>
        Every role has a set of permissions that define what actions that role
        can perform. Roles can be assigned to users, and users can have multiple
        roles. This allows for a lot of flexibility in how groups can be
        organized, as well as how the server is structured as a whole.
      </Typography>

      <Typography marginBottom={1.5}>Server permissions:</Typography>

      <DocsPermissionList permissionType="server" />

      <Typography marginBottom={1.5}>Group permissions:</Typography>

      <DocsPermissionList permissionType="group" />

      <DocsSubheading>Work in Progress</DocsSubheading>

      <Typography marginBottom={1.5}>
        Praxis is still in development and there are a lot of features that are
        still being worked on, meaning the documentation is also likely to
        change as the project is still getting off the ground. If you'd like to
        contribute or have any questions at all, feel free to reach out to us on
        <DocsLink href="https://github.com/praxis-app" text="GitHub" external />
        .
      </Typography>
    </Box>
  );
};

export default DocsHomePage;
