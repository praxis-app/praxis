import { Box, Button, SxProps, Typography } from '@mui/material';
import { truncate } from 'lodash';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TruncationSizes } from '../../../constants/shared.constants';
import { UserAvatarFragment } from '../../../graphql/users/fragments/gen/UserAvatar.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import { getUserProfilePath } from '../../../utils/user.utils';
import Flex from '../../Shared/Flex';
import Link from '../../Shared/Link';
import UserAvatar from '../../Users/UserAvatar';

const DEFAULT_MEMBERS_SHOWN = 4;

interface Props {
  members: UserAvatarFragment[];
  header: string;
}

const ServerRoleMembersView = ({ members, header }: Props) => {
  const [showMoreMembers, setShowMoreMembers] = useState(false);

  const { t } = useTranslation();
  const isDesktop = useIsDesktop();

  const membersShown = showMoreMembers
    ? members
    : members.slice(0, DEFAULT_MEMBERS_SHOWN);

  const viewMoreBtnStyles: SxProps = {
    textTransform: 'none',
    paddingY: 0.2,
    color: 'text.secondary',
    fontFamily: 'Inter Bold',
    marginTop: 0.5,
  };
  const linkStyles: SxProps = {
    width: isDesktop ? '235px' : '100%',
    display: 'flex',
    gap: 1.3,
  };

  if (!members.length) {
    return null;
  }

  return (
    <Box marginBottom={1.25}>
      <Typography
        fontFamily="Inter Bold"
        marginBottom={1.2}
        textTransform="uppercase"
        fontSize={15}
      >
        {header}
      </Typography>

      <Flex
        paddingLeft={isDesktop ? 0.1 : 0.5}
        flexDirection={isDesktop ? 'row' : 'column'}
        flexWrap={isDesktop ? 'wrap' : 'nowrap'}
        gap={isDesktop ? 1.6 : 1.4}
      >
        {membersShown.map((member) => {
          const username = member.displayName || member.name;
          const truncatedUsername = truncate(username, {
            length: isDesktop ? TruncationSizes.Small : TruncationSizes.Medium,
          });
          const userPath = getUserProfilePath(member.name);

          return (
            <Link key={member.id} href={userPath} sx={linkStyles}>
              <UserAvatar user={member} size={25} />
              {truncatedUsername}
            </Link>
          );
        })}
      </Flex>

      {members.length > DEFAULT_MEMBERS_SHOWN && !showMoreMembers && (
        <Button
          onClick={() => setShowMoreMembers(!showMoreMembers)}
          sx={viewMoreBtnStyles}
        >
          {t('about.actions.viewAllMembers', {
            count: members.length,
          })}
        </Button>
      )}
    </Box>
  );
};

export default ServerRoleMembersView;
