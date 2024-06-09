import { Typography } from '@mui/material';
import { truncate } from 'lodash';
import { TruncationSizes } from '../../../constants/shared.constants';
import { UserAvatarFragment } from '../../../graphql/users/fragments/gen/UserAvatar.gen';
import { useIsDesktop } from '../../../hooks/shared.hooks';
import { getUserProfilePath } from '../../../utils/user.utils';
import Flex from '../../Shared/Flex';
import Link from '../../Shared/Link';
import UserAvatar from '../../Users/UserAvatar';

interface Props {
  members: UserAvatarFragment[];
  header: string;
}

const ServerRoleMembersView = ({ members, header }: Props) => {
  const isDesktop = useIsDesktop();

  if (!members.length) {
    return null;
  }

  return (
    <>
      <Typography
        fontFamily="Inter Bold"
        marginBottom={1.2}
        textTransform="uppercase"
        fontSize={15}
      >
        {header}
      </Typography>

      <Flex
        flexDirection={isDesktop ? 'row' : 'column'}
        flexWrap={isDesktop ? 'wrap' : 'nowrap'}
        gap={isDesktop ? 1.6 : 1.4}
        marginBottom={1.25}
        paddingLeft={isDesktop ? 0.1 : 0.5}
      >
        {members.map((member) => {
          const username = member.displayName || member.name;
          const truncatedUsername = truncate(username, {
            length: isDesktop ? TruncationSizes.Small : TruncationSizes.Medium,
          });
          const userPath = getUserProfilePath(member.name);

          return (
            <Link
              key={member.id}
              href={userPath}
              sx={{
                width: isDesktop ? '235px' : '100%',
                display: 'flex',
                gap: 1.3,
              }}
            >
              <UserAvatar user={member} size={25} />
              {truncatedUsername}
            </Link>
          );
        })}
      </Flex>
    </>
  );
};

export default ServerRoleMembersView;
